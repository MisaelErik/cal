

import { GoogleGenAI } from '@google/genai';
import type { CalculationPlan, Mode, Provider, ChatMessage, ExecutedStep, AppResult } from '../types';
import { PRECISE_SYSTEM_PROMPT, EXPERIMENTAL_SYSTEM_PROMPT, OPENROUTER_MODELS, CHAT_SYSTEM_PROMPT, PROVIDER_NAMES } from '../constants';

type OpenRouterProvider = 'openrouter_kimi' | 'openrouter_mistral' | 'openrouter_geo' | 'openrouter_deepseek';

// Helper to convert File to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        if (typeof reader.result !== 'string') {
            return reject('FileReader did not return a string.');
        }
        // result is "data:image/png;base64,iVBORw0KGgo..."
        // we need to strip the prefix
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
    };
    reader.onerror = error => reject(error);
  });
}

export async function extractTextFromImage(file: File): Promise<string> {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("La clave de API para Google AI Studio no está configurada en las variables de entorno (API_KEY).");
    }
    const ai = new GoogleGenAI({ apiKey });
    
    const base64Data = await fileToBase64(file);

    const imagePart = {
      inlineData: {
        mimeType: file.type,
        data: base64Data,
      },
    };

    const textPart = {
        text: "Extrae el texto de esta imagen que contiene un problema de matemática financiera. Devuelve únicamente el texto extraído, sin explicaciones, formato o markdown."
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] }
    });
    
    return response.text;
}


async function callGoogleStudio(systemPrompt: string, userPrompt: string, signal: AbortSignal): Promise<string> {
    // Note: The GoogleGenAI SDK does not currently support AbortSignal for generateContent.
    // This is included for API consistency. We can check for aborts before the call.
    if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
    
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("La clave de API para Google AI Studio no está configurada en las variables de entorno (API_KEY).");
    }
    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userPrompt,
        config: {
            systemInstruction: systemPrompt,
            responseMimeType: "application/json",
        },
    });

    return response.text;
}


async function callOpenRouter(provider: OpenRouterProvider, systemPrompt: string, userPrompt: string, signal: AbortSignal): Promise<string> {
    const providerKey = provider.replace('openrouter_', '') as keyof typeof OPENROUTER_MODELS;
    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = OPENROUTER_MODELS[providerKey];

    if (!apiKey) {
        throw new Error(`La clave de API para OpenRouter no está configurada en las variables de entorno (OPENROUTER_API_KEY).`);
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://example.com", // Requerido por la política de OpenRouter
            "X-Title": "FinanCalc AI", // Opcional, para rankings
        },
        body: JSON.stringify({
            model: model,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            max_tokens: 2048,
        }),
        signal: signal,
    });

    if (!response.ok) {
        const errorBodyText = await response.text();
        console.error(`OpenRouter API error for ${provider}:`, response.status, errorBodyText);
        
        const providerName = PROVIDER_NAMES[provider as keyof typeof PROVIDER_NAMES] || provider;
        let errorMessage;

        if (response.status === 429) {
            errorMessage = `El proveedor '${providerName}' está actualmente sobrecargado (Error 429). Por favor, intente de nuevo más tarde o seleccione otro proveedor.`;
        } else if (response.status === 402) {
             errorMessage = `La API para '${providerName}' indica que no hay suficientes créditos para esta solicitud (Error 402).`;
        } else if (response.status === 408) {
             errorMessage = `El proveedor '${providerName}' tardó demasiado en responder (Error 408: Timeout). Esto puede deberse a una alta demanda. Intente de nuevo más tarde.`;
        } else {
            errorMessage = `Error de la API de OpenRouter (${providerName}, Status: ${response.status}).`;
            try {
                const errorJson = JSON.parse(errorBodyText);
                if (errorJson.error && errorJson.error.message) {
                    errorMessage += ` Mensaje: ${errorJson.error.message}`;
                } else {
                     errorMessage += ` Detalles: ${errorBodyText}`;
                }
            } catch (e) {
                 errorMessage += ` Detalles: ${errorBodyText}`;
            }
        }
        throw new Error(errorMessage);
    }

    const data = await response.json();
    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
        console.error("Invalid response structure from OpenRouter:", data);
        throw new Error("Respuesta inválida recibida de la API de OpenRouter.");
    }
    
    return data.choices[0].message.content;
}

export async function generateCalculationPlan(provider: Exclude<Provider, 'all'>, mode: Mode, problem: string, signal: AbortSignal): Promise<CalculationPlan> {
    const systemPrompt = mode === 'preciso' ? PRECISE_SYSTEM_PROMPT : EXPERIMENTAL_SYSTEM_PROMPT;
    const userPrompt = `Problema a resolver: "${problem}"`;

    try {
        let rawJsonText: string;

        if (provider === 'gemini_studio') {
             rawJsonText = await callGoogleStudio(systemPrompt, userPrompt, signal);
        } else {
             rawJsonText = await callOpenRouter(provider as OpenRouterProvider, systemPrompt, userPrompt, signal);
        }
        
        let jsonString: string | null = null;
    
        // Attempt to find JSON within markdown code blocks
        const markdownMatch = rawJsonText.match(/```json\s*([\s\S]+?)\s*```/);
        if (markdownMatch && markdownMatch[1]) {
            jsonString = markdownMatch[1];
        } else {
            // If not in a code block, find the first '{' and last '}'
            const startIndex = rawJsonText.indexOf('{');
            const endIndex = rawJsonText.lastIndexOf('}');
            if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
                jsonString = rawJsonText.substring(startIndex, endIndex + 1);
            }
        }
        
        if (!jsonString) {
            console.error(`Raw response from ${provider}:`, rawJsonText);
            throw new Error(`La respuesta de ${provider} no contiene un objeto JSON válido.`);
        }

        try {
            // Clean the JSON string
            // 1. Add missing commas between properties separated by newlines.
            // This addresses cases where the AI forgets a comma, like:
            // "prop1": "value1"
            // "prop2": "value2"
            let cleanedJsonString = jsonString.replace(/(["}\]])\s*\n\s*(")/g, '$1,\n$2');

            // 2. Remove trailing commas which are invalid in standard JSON.
            cleanedJsonString = cleanedJsonString.replace(/,\s*([}\]])/g, '$1');

            return JSON.parse(cleanedJsonString) as CalculationPlan;
        } catch (parseError) {
            console.error(`Failed to parse JSON from ${provider}. Raw string for parsing:`, jsonString, "Original response from provider:", rawJsonText);
            const message = parseError instanceof Error ? parseError.message : String(parseError);
            throw new Error(`Error al procesar la respuesta de ${provider}. La IA puede haber devuelto un formato inválido. Detalles: ${message}`);
        }

    } catch (error) {
        console.error(`Error calling API for provider ${provider}:`, error);
        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                throw error; // Re-throw AbortError to be handled upstream
            }
            // Do not wrap the error if it's already descriptive
            if (error.message.includes('API de OpenRouter') || error.message.includes('Google AI Studio') || error.message.includes('procesar la respuesta') || error.message.includes('El proveedor')) {
                throw error;
            }
            throw new Error(`Error de la API para ${provider}: ${error.message}`);
        }
        throw new Error(`Se produjo un error desconocido al comunicarse con la IA para ${provider}.`);
    }
}

async function callChatApi(provider: Exclude<Provider, 'all'>, systemPrompt: string, userPrompt: string, signal: AbortSignal): Promise<string> {
    if (provider === 'gemini_studio') {
        const apiKey = process.env.API_KEY;
        if (!apiKey) throw new Error("La clave de API para Google AI Studio no está configurada en las variables de entorno (API_KEY).");
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userPrompt,
            config: { systemInstruction: systemPrompt },
        });
        return response.text;
    } else {
        return await callOpenRouter(provider as OpenRouterProvider, systemPrompt, userPrompt, signal);
    }
}


export async function generateChatResponse(
    provider: Exclude<Provider, 'all'>,
    problem: string,
    allResults: AppResult[],
    history: ChatMessage[],
    question: string
): Promise<string> {
    
    const controller = new AbortController(); // Chat doesn't have a cancel button yet, but good practice.
    
    // Build a detailed prompt with all context
    const resultsContext = allResults.map(res => {
        const providerName = PROVIDER_NAMES[res.provider as keyof typeof PROVIDER_NAMES] || res.provider;
        if (res.error) {
            return `**Análisis de ${providerName}:**\n- ESTADO: Falló\n- ERROR: ${res.error}\n\n`;
        }
        if (res.plan && res.executedSteps) {
            const finalStep = res.executedSteps[res.executedSteps.length - 1];
            return `**Análisis de ${providerName}:**
- INTERPRETACIÓN: ${res.plan.interpretation}
- DATOS INICIALES: ${JSON.stringify(res.plan.initial_data)}
- PASOS: 
${res.executedSteps.map((s, i) => `  ${i+1}. ${s.step_name} -> ${s.target_variable}: ${s.result}`).join('\n')}
- RESULTADO FINAL (${finalStep.target_variable}): ${finalStep.result}

`;
        }
        return `**Análisis de ${providerName}:**\n- No se pudo procesar el resultado.\n\n`;
    }).join('');

    const contextPrompt = `
**Problema Original del Usuario:**
${problem}

**Resumen de Resultados de las IAs:**
${resultsContext}

**Historial de la Conversación Actual:**
${history.map(msg => `${msg.role === 'user' ? 'Usuario' : 'Asistente'}: ${msg.content}`).join('\n')}

**Nueva Pregunta del Usuario:**
${question}
    `;

    return await callChatApi(provider, CHAT_SYSTEM_PROMPT, contextPrompt, controller.signal);
}