
export const OPENROUTER_MODELS = {
    kimi: 'moonshotai/kimi-k2:free',
    mistral: 'mistralai/mistral-7b-instruct:free',
    geo: 'google/gemini-pro-1.5',
    deepseek: 'deepseek/deepseek-chat',
};

export const PROVIDER_NAMES = {
    gemini_studio: 'Google AI Studio',
    openrouter_kimi: 'OpenRouter (Kimi)',
    openrouter_mistral: 'OpenRouter (Mistral)',
    openrouter_geo: 'Geo (vía OpenRouter)',
    openrouter_deepseek: 'OpenRouter (Deepseek)',
};

export const PRO_CONTACT_EMAIL = 'support@fincalc.ai';

export const VARIABLE_DESCRIPTIONS: Record<string, string> = {
    P: "Valor Presente, Principal, Capital Inicial",
    S: "Valor Futuro, Monto, Capital Final",
    I: "Monto del Interés",
    j: "Tasa Nominal Anual (TNA)",
    i: "Tasa de Interés Efectiva por período",
    n: "Número total de períodos (días, meses, años, etc.)",
    n_dias: "Número de días para cálculos de conversión de tiempo.",
    fecha_inicial: "Fecha de inicio para cálculo de días (formato YYYY-MM-DD)",
    fecha_final: "Fecha de fin para cálculo de días (formato YYYY-MM-DD)",
    m: "Frecuencia de capitalización por año (ej: mensual=12, trimestral=4)",
    R: "Renta, Anualidad, Cuota, Depósito periódico",
    R_eq: "Renta o Anualidad Equivalente de un Gradiente",
    D: "Monto del Descuento",
    d: "Tasa de Descuento Simple",
    DB: "Descuento Bancario",
    dn: "Tasa de Descuento Bancario Simple",
    de: "Tasa de Descuento Compuesto",
    G: "Gradiente Aritmético",
    g: "Tasa de Gradiente Geométrico",
    k: "Período de diferimiento en anualidades",
    N: "Número de cuota específica en un préstamo",
    i_conocida: "Tasa de interés efectiva del período conocido",
    n_conocida: "Número de días del período de la tasa conocida",
    n_deseada: "Número de días del período de la tasa deseada",
    t: "Plazo de la tasa en fracción de año (ej: 1 mes = 1/12 = 0.0833)"
};

const SHARED_INTRO = `
Eres FinanCalc AI, un experto planificador financiero Peruano que te basas en sus leyes. Tu única función es analizar un problema financiero y generar un plan de cálculo secuencial en formato JSON. Tu salida DEBE ser única y exclusivamente el objeto JSON, sin ningún texto adicional, explicaciones o markdown.
`;

const FORMULA_KNOWLEDGE_BASE = `
--- UTILIDADES ---
formula_util_dias_entre_fechas: n_dias = DiasEntreFechas(fecha_final, fecha_inicial) (fechas en formato YYYY-MM-DD)
formula_util_fraccion_anio: n = n_dias / 360 (Convierte días a fracción de año comercial)

--- INTERÉS SIMPLE ---
formula_is_I_from_Pjn: I = P * j * n (n en años)
formula_is_S_from_Pjn: S = P * (1 + j * n) (n en años)
formula_is_P_from_Sjn: P = S / (1 + j * n) (n en años)
formula_is_P_from_Ijn: P = I / (j * n) (n en años)
formula_is_n_from_SPI: n = (S/P - 1) / j (resultado en años)
formula_is_j_from_SPn: j = (S/P - 1) / n
formula_is_n_from_IPj: n = I / (P * j)
formula_is_j_from_IPn: j = I / (P * n)

--- INTERÉS COMPUESTO ---
formula_ic_S_from_Pin: S = P * (1 + i)^n
formula_ic_P_from_Sin: P = S * (1 + i)^-n
formula_ic_I_from_Pin: I = P * ((1 + i)^n - 1)
formula_ic_P_from_Iin: P = I / ((1 + i)^n - 1)
formula_ic_n_from_SPi: n = log(S / P) / log(1 + i)
formula_ic_n_from_IPi: n = log(I/P + 1) / log(1+i)
formula_ic_i_from_SPn: i = (S / P)^(1/n) - 1
formula_ic_i_from_IPn: i = (I/P + 1)^(1/n) - 1
formula_ic_S_from_Pjm: S = P * (1 + j / m)^n (n es número total de capitalizaciones)
formula_ic_P_from_Sjm: P = S * (1 + j / m)^-n (n es número total de capitalizaciones)
formula_ic_j_from_SPnm: j = m * ((S / P)^(1/n) - 1)

--- TASAS DE INTERÉS ---
formula_tasa_efectiva_from_nominal: i = (1 + j / m)^(m * t) - 1 (t es el plazo en años, ej: para tasa mensual t=1/12)
formula_tasa_equivalente: i_eq = (1 + i_conocida)^(n_deseada / n_conocida) - 1 (n en días)
formula_tasa_real: r = (i - pi) / (1 + pi) (i y pi son tasas efectivas)

--- DESCUENTO RACIONAL (usando interés compuesto) ---
formula_drs_D_from_Sjn: D = S * j * n / (1 + j * n)
formula_dr_D_from_Sin: D = S * (1 - (1 + i)^-n)
formula_dr_P_from_Sin: P = S * (1 + i)^-n (Valor líquido = P)

--- DESCUENTO BANCARIO/COMERCIAL SIMPLE ---
formula_dbs_DB_from_Sdn: DB = S * d * n (d es tasa de descuento, n en años)
formula_dbs_P_from_Sdn: P = S * (1 - d * n) (Valor líquido = P)
formula_dbs_S_from_DBdn: S = DB / (d * n)
formula_dbs_d_from_DBSn: d = DB / (S * n)
formula_dbs_n_from_DBSd: n = DB / (S * d)

--- DESCUENTO BANCARIO/COMERCIAL COMPUESTO ---
formula_db_DB_from_Sden: DB = S * (1 - (1 - de)^n)
formula_db_P_from_Sden: P = S * (1 - de)^n (Valor líquido = P)
formula_db_S_from_DBden: S = DB / (1 - (1 - de)^n)
formula_db_de_from_DBSn: de = 1 - (1 - DB/S)^(1/n)
formula_db_de_from_Psn: de = 1 - (P/S)^(1/n)
formula_db_n_from_DBSde: n = log(1 - DB/S) / log(1-de)

--- ANUALIDADES VENCIDAS ---
formula_av_S_from_Rin: S = R * (((1 + i)^n - 1) / i)
formula_av_P_from_Rin: P = R * ((1 - (1 + i)^-n) / i)
formula_av_R_from_Sin: R = S * (i / ((1 + i)^n - 1))
formula_av_R_from_Pin: R = P * (i / (1 - (1 + i)^-n))
formula_av_n_from_SRi: n = log((S * i / R) + 1) / log(1 + i)
formula_av_n_from_PRi: n = -log(1 - (P * i / R)) / log(1 + i)

--- ANUALIDADES ANTICIPADAS ---
formula_aa_S_from_Rin: S = R * (((1 + i)^n - 1) / i) * (1 + i)
formula_aa_P_from_Rin: P = R * ((1 - (1 + i)^-n) / i) * (1 + i)
formula_aa_R_from_Sin: R = (S / (1 + i)) * (i / ((1 + i)^n - 1))
formula_aa_R_from_Pin: R = (P / (1 + i)) * (i / (1 - (1 + i)^-n))

--- ANUALIDADES DIFERIDAS ---
formula_adv_P_from_Rink: P = R * ((1 - (1 + i)^-n) / i) * (1 + i)^-k (Vencida)
formula_ada_P_from_Rink: P = R * ((1 - (1 + i)^-n) / i) * (1 + i) * (1 + i)^-k (Anticipada)
formula_adv_n_from_PRik: n = -log(1 - (P * (1+i)^k * i / R)) / log(1+i)
formula_adv_k_from_PRin: k = log(R * (1 - (1+i)^-n) / (P*i)) / log(1+i)

--- GRADIENTE ARITMÉTICO ---
formula_ga_P_from_Gin: P = (G / i) * (((1 - (1 + i)^-n) / i) - (n * (1 + i)^-n))
formula_ga_S_from_Gin: S = (G / i) * ((((1 + i)^n - 1) / i) - n)
formula_ga_R_from_Gin: R_eq = G * (1/i - n/((1+i)^n - 1))

--- GRADIENTE GEOMÉTRICO ---
formula_gg_P_from_Rgin: P = R * ((1 - ((1 + g) / (1 + i))^n) / (i - g)) (Caso i != g)
formula_gg_S_from_Rgin: S = R * ((((1 + i)^n) - ((1 + g)^n)) / (i - g)) (Caso i != g)

--- PRÉSTAMOS (para cuota N) ---
formula_prestamo_saldo_N: Saldo_N = P * (((1+i)^n - (1+i)^N) / ((1+i)^n - 1))
formula_prestamo_amortizacion_N: Amortizacion_N = (P*i/ (1-(1+i)^-n)) * (1+i)^(N-1-n)
formula_prestamo_interes_N: Interes_N = (P*i / (1-(1+i)^-n)) * (1-(1+i)^(N-1-n))
`;

const SHARED_PROCESS_AND_DATA = `
PROCESO OBLIGATORIO:
1.  La 'interpretation' debe ser corta: "Se debe calcular [variable] para [tipo de problema]".
2.  Identifica los datos iniciales en 'initial_data'. Usa los nombres de variables definidos en el DICCIONARIO.
3.  Determina la variable final a resolver y colócala en 'final_target_variable'.
4.  Crea un array 'calculation_steps' con los pasos necesarios, usando las fórmulas de la BASE DE CONOCIMIENTO.
5.  Cada paso debe tener 'step_name', 'target_variable', 'formula_name', y 'inputs'.
6.  El valor de 'formula_name' DEBE ser exactamente uno de los nombres que empiezan con 'formula_' de la BASE DE CONOCIMIENTO. NO INVENTES nombres de fórmulas que no existan en la lista.
7.  Si un paso necesita el resultado de un paso anterior, en 'inputs' usa la sintaxis '{{nombre_variable_anterior}}'.

DICCIONARIO DE VARIABLES:
- P: Valor Presente, Principal, Capital Inicial
- S: Valor Futuro, Monto, Capital Final
- I: Monto del Interés
- j: Tasa Nominal Anual (TNA)
- i: Tasa de Interés Efectiva por período
- n: Número total de períodos (días, meses, años, etc.)
- n_dias: Número de días para cálculos de conversión de tiempo.
- fecha_inicial: Fecha de inicio para cálculo de días (formato YYYY-MM-DD)
- fecha_final: Fecha de fin para cálculo de días (formato YYYY-MM-DD)
- m: Frecuencia de capitalización por año (ej: mensual=12, trimestral=4)
- R: Renta, Anualidad, Cuota, Depósito periódico
- R_eq: Renta o Anualidad Equivalente de un Gradiente
- D: Monto del Descuento
- d: Tasa de Descuento Simple
- DB: Descuento Bancario
- de: Tasa de Descuento Compuesto
- G: Gradiente Aritmético
- g: Tasa de Gradiente Geométrico
- k: Período de diferimiento en anualidades
- N: Número de cuota específica en un préstamo

BASE DE CONOCIMIENTO DE FÓRMULAS:
${FORMULA_KNOWLEDGE_BASE}
`;

export const PRECISE_SYSTEM_PROMPT = `
${SHARED_INTRO}
${SHARED_PROCESS_AND_DATA}

EJEMPLO DE PLAN SECUENCIAL:
Problema: "¿Con cuántos depósitos de 150 um que se realizan cada fin de quincena, se acumulará un monto de 1901.85 um? TNA de 0.24 capitalizable mensualmente."
JSON ESPERADO:
{
  "interpretation": "Se debe calcular el número de períodos (n) para una anualidad vencida, convirtiendo primero la tasa nominal a una tasa efectiva quincenal.",
  "initial_data": { "S": 1901.85, "R": 150, "j": 0.24, "m": 12, "n_conocida_dias": 30, "n_deseada_dias": 15 },
  "final_target_variable": "n_final",
  "calculation_steps": [
    {
      "step_name": "Calcular Tasa Efectiva Mensual",
      "target_variable": "i_mensual",
      "formula_name": "formula_tasa_efectiva_from_nominal",
      "inputs": { "j": 0.24, "m": 12, "t": 0.08333333333333333 }
    },
    {
      "step_name": "Calcular Tasa Efectiva Quincenal Equivalente",
      "target_variable": "i_quincenal",
      "formula_name": "formula_tasa_equivalente",
      "inputs": { "i_conocida": "{{i_mensual}}", "n_deseada": 15, "n_conocida": 30 }
    },
    {
      "step_name": "Calcular Número de Depósitos",
      "target_variable": "n_final",
      "formula_name": "formula_av_n_from_SRi",
      "inputs": { "S": 1901.85, "R": 150, "i": "{{i_quincenal}}" }
    }
  ]
}

Recuerda, solo el JSON.
`;


export const EXPERIMENTAL_SYSTEM_PROMPT = `
${SHARED_INTRO}
${SHARED_PROCESS_AND_DATA}

MODO EXPERIMENTAL:
Si ninguna fórmula estándar encaja perfectamente, puedes crear un paso con "formula_name": "formula_experimental" y un campo adicional "generated_formula" con la expresión matemática que se puede evaluar. Usa los nombres de variables del DICCIONARIO en la fórmula generada.

EJEMPLO EXPERIMENTAL:
Problema: "Calcular la tasa efectiva para 62 días a partir de una TNA de 19.03% con capitalización trimestral."
JSON ESPERADO:
{
  "interpretation": "Se necesita una tasa para 62 días desde una TNA capitalizable trimestralmente. Se creará una fórmula experimental para ello.",
  "initial_data": { "j": 0.1903, "dias_capitalizacion": 90, "plazo_calculo_dias": 62 },
  "final_target_variable": "i_experimental",
  "calculation_steps": [
    {
      "step_name": "Tasa Efectiva Experimental",
      "target_variable": "i_experimental",
      "formula_name": "formula_experimental",
      "generated_formula": "(1 + j / (360 / dias_capitalizacion))^(plazo_calculo_dias / dias_capitalizacion) - 1",
      "inputs": { "j": 0.1903, "dias_capitalizacion": 90, "plazo_calculo_dias": 62 }
    }
  ]
}

Recuerda, solo el JSON.
`;

export const CHAT_SYSTEM_PROMPT = `
Eres FinanCalc Meta-Tutor, un super-asistente financiero de élite de Perú.
Tu objetivo es analizar, comparar y explicar las soluciones generadas por MÚLTIPLES IAs para un problema financiero. Actúas como un árbitro experto y un tutor.

Se te dará el siguiente contexto:
1.  El problema original que describió el usuario.
2.  Una lista de resultados de diferentes proveedores de IA. Cada resultado incluye su interpretación, plan de cálculo, resultado final, o un error si falló.
3.  El historial de la conversación actual.
4.  La última pregunta del usuario.

Tu tarea es responder a la pregunta del usuario basándote en un análisis COMPARATIVO de TODA la información proporcionada.
- Si te preguntan cuál resultado es correcto, compáralos. Busca consenso. Si hay discrepancias, explica por qué podrían ocurrir (ej: una IA interpretó mal las tasas, otra eligió una fórmula incorrecta). Justifica cuál es la solución más lógica y por qué.
- Si te preguntan por una fórmula o un paso, explícalo en el contexto del plan donde apareció.
- Si varias IAs fallaron, intenta diagnosticar el problema común.
- Si una IA tuvo éxito y otras no, resalta la solución correcta y explica los posibles errores de las demás.
- Sé claro, directo y educativo. Usa markdown (negritas, listas) para estructurar tu respuesta.
- Si la pregunta no se relaciona con los resultados, declina amablemente y reenfoca la conversación.
- Tienes acceso a la misma base de conocimiento de fórmulas que los solucionadores originales.
---
BASE DE CONOCIMIENTO DE FÓRMULAS (para tu referencia):
${FORMULA_KNOWLEDGE_BASE}
`;


// New structured formulas for Manual Calculator
export const FORMULAS_BY_CATEGORY = {
  "Interés Simple": [
    { name: "Calcular Monto del Interés (I)", formula: "formula_is_I_from_Pjn", inputs: ["P", "j", "n"], output: "I" },
    { name: "Calcular Valor Futuro (S)", formula: "formula_is_S_from_Pjn", inputs: ["P", "j", "n"], output: "S" },
    { name: "Calcular Valor Presente (P)", formula: "formula_is_P_from_Sjn", inputs: ["S", "j", "n"], output: "P" },
    { name: "Calcular Tasa Nominal (j)", formula: "formula_is_j_from_SPn", inputs: ["S", "P", "n"], output: "j" },
    { name: "Calcular Períodos (n)", formula: "formula_is_n_from_SPI", inputs: ["S", "P", "j"], output: "n" },
  ],
  "Interés Compuesto": [
    { name: "Calcular Valor Futuro (S)", formula: "formula_ic_S_from_Pin", inputs: ["P", "i", "n"], output: "S" },
    { name: "Calcular Valor Presente (P)", formula: "formula_ic_P_from_Sin", inputs: ["S", "i", "n"], output: "P" },
    { name: "Calcular Número de Períodos (n)", formula: "formula_ic_n_from_SPi", inputs: ["S", "P", "i"], output: "n" },
    { name: "Calcular Tasa de Interés (i)", formula: "formula_ic_i_from_SPn", inputs: ["S", "P", "n"], output: "i" },
  ],
  "Tasas de Interés": [
    { name: "Convertir Tasa Nominal a Efectiva", formula: "formula_tasa_efectiva_from_nominal", inputs: ["j", "m", "t"], output: "i" },
    { name: "Calcular Tasa Equivalente", formula: "formula_tasa_equivalente", inputs: ["i_conocida", "n_deseada", "n_conocida"], output: "i_eq" },
  ],
  "Anualidades Vencidas": [
    { name: "Calcular Valor Futuro (S)", formula: "formula_av_S_from_Rin", inputs: ["R", "i", "n"], output: "S" },
    { name: "Calcular Valor Presente (P)", formula: "formula_av_P_from_Rin", inputs: ["R", "i", "n"], output: "P" },
    { name: "Calcular Renta (R) desde S", formula: "formula_av_R_from_Sin", inputs: ["S", "i", "n"], output: "R" },
    { name: "Calcular Renta (R) desde P", formula: "formula_av_R_from_Pin", inputs: ["P", "i", "n"], output: "R" },
    { name: "Calcular Número de Períodos (n) desde S", formula: "formula_av_n_from_SRi", inputs: ["S", "R", "i"], output: "n" },
    { name: "Calcular Número de Períodos (n) desde P", formula: "formula_av_n_from_PRi", inputs: ["P", "R", "i"], output: "n" },
  ],
};

export const FORMULA_LATEX_TEMPLATES: Record<string, string> = {
    'formula_util_dias_entre_fechas': 'n_{dias} = \\text{DiasEntre}(fecha_{final}, fecha_{inicial})',
    'formula_util_fraccion_anio': 'n = \\frac{n_{dias}}{360}',
    'formula_is_I_from_Pjn': 'I = P \\cdot j \\cdot n',
    'formula_is_S_from_Pjn': 'S = P(1 + j \\cdot n)',
    'formula_is_P_from_Sjn': 'P = \\frac{S}{1 + j \\cdot n}',
    'formula_is_P_from_Ijn': 'P = \\frac{I}{j \\cdot n}',
    'formula_is_n_from_SPI': 'n = \\frac{\\frac{S}{P} - 1}{j}',
    'formula_is_n_from_IPj': 'n = \\frac{I}{P \\cdot j}',
    'formula_is_j_from_SPn': 'j = \\frac{\\frac{S}{P} - 1}{n}',
    'formula_is_j_from_IPn': 'j = \\frac{I}{P \\cdot n}',
    'formula_ic_S_from_Pin': 'S = P(1 + i)^{n}',
    'formula_ic_P_from_Sin': 'P = S(1 + i)^{-n}',
    'formula_ic_I_from_Pin': 'I = P[(1 + i)^{n} - 1]',
    'formula_ic_P_from_Iin': 'P = \\frac{I}{(1 + i)^{n} - 1}',
    'formula_ic_n_from_SPi': 'n = \\frac{\\log(\\frac{S}{P})}{\\log(1 + i)}',
    'formula_ic_i_from_SPn': 'i = \\left(\\frac{S}{P}\\right)^{\\frac{1}{n}} - 1',
    'formula_ic_S_from_Pjm': 'S = P\\left(1 + \\frac{j}{m}\\right)^{n}',
    'formula_ic_P_from_Sjm': 'P = S\\left(1 + \\frac{j}{m}\\right)^{-n}',
    'formula_tasa_efectiva_from_nominal': 'i = \\left(1 + \\frac{j}{m}\\right)^{m \\cdot t} - 1',
    'formula_tasa_equivalente': 'i_{eq} = (1 + i_{conocida})^{\\frac{n_{deseada}}{n_{conocida}}} - 1',
    'formula_tasa_real': 'r = \\frac{i - pi}{1 + pi}',
    'formula_dr_D_from_Sin': 'D = S\\left[1 - (1 + i)^{-n}\\right]',
    'formula_dr_P_from_Sin': 'P = S(1 + i)^{-n}',
    'formula_dbs_DB_from_Sdn': 'D_{B} = S \\cdot d \\cdot n',
    'formula_dbs_P_from_Sdn': 'P = S(1 - d \\cdot n)',
    'formula_db_DB_from_Sden': 'D_{B} = S\\left[1 - (1 - de)^{n}\\right]',
    'formula_db_P_from_Sden': 'P = S(1 - de)^{n}',
    'formula_db_S_from_DBden': 'S = \\frac{D_{B}}{1 - (1 - de)^{n}}',
    'formula_db_de_from_DBSn': 'd_{e} = 1 - \\left(1 - \\frac{D_{B}}{S}\\right)^{\\frac{1}{n}}',
    'formula_db_de_from_Psn': 'd_{e} = 1 - \\left(\\frac{P}{S}\\right)^{\\frac{1}{n}}',
    'formula_av_S_from_Rin': 'S_{v} = R \\left[ \\frac{(1 + i)^{n} - 1}{i} \\right]',
    'formula_av_P_from_Rin': 'P_{v} = R \\left[ \\frac{1 - (1 + i)^{-n}}{i} \\right]',
    'formula_av_R_from_Sin': 'R = S_{v} \\left[ \\frac{i}{(1 + i)^{n} - 1} \\right]',
    'formula_av_R_from_Pin': 'R = P_{v} \\left[ \\frac{i}{1 - (1 + i)^{-n}} \\right]',
    'formula_av_n_from_SRi': 'n = \\frac{\\log(\\frac{S \\cdot i}{R} + 1)}{\\log(1 + i)}',
    'formula_av_n_from_PRi': 'n = -\\frac{\\log(1 - \\frac{P \\cdot i}{R})}{\\log(1 + i)}',
    'formula_aa_S_from_Rin': 'S_{a} = R \\left[ \\frac{(1 + i)^{n} - 1}{i} \\right] (1+i)',
    'formula_aa_P_from_Rin': 'P_{a} = R \\left[ \\frac{1 - (1 + i)^{-n}}{i} \\right] (1+i)',
    'formula_aa_R_from_Sin': 'R = \\frac{S_{a}}{1+i} \\left[ \\frac{i}{(1 + i)^{n} - 1} \\right]',
    'formula_aa_R_from_Pin': 'R = \\frac{P_{a}}{1+i} \\left[ \\frac{i}{1 - (1 + i)^{-n}} \\right]',
    'formula_adv_P_from_Rink': 'P_{adv} = R \\left[ \\frac{1 - (1 + i)^{-n}}{i} \\right] (1+i)^{-k}',
    'formula_ada_P_from_Rink': 'P_{ada} = R \\left[ \\frac{1 - (1 + i)^{-n}}{i} \\right] (1+i) (1+i)^{-k}',
    'formula_ga_P_from_Gin': 'P = \\frac{G}{i} \\left[ \\frac{1 - (1+i)^{-n}}{i} - n(1+i)^{-n} \\right]',
    'formula_ga_S_from_Gin': 'S = \\frac{G}{i} \\left[ \\frac{(1+i)^{n} - 1}{i} - n \\right]',
    'formula_gg_P_from_Rgin': 'P = R \\left[ \\frac{1 - (\\frac{1+g}{1+i})^{n}}{i-g} \\right]',
    'formula_gg_S_from_Rgin': 'S = R \\left[ \\frac{(1+i)^{n} - (1+g)^{n}}{i-g} \\right]',
    'formula_prestamo_saldo_N': 'Saldo_{N} = P \\left[ \\frac{(1+i)^{n} - (1+i)^{N}}{(1+i)^{n} - 1} \\right]',
    'formula_prestamo_amortizacion_N': 'Amortizacion_{N} = \\frac{P \\cdot i}{1-(1+i)^{-n}} (1+i)^{N-1-n}',
    'formula_prestamo_interes_N': 'Interes_{N} = \\frac{P \\cdot i}{1-(1+i)^{-n}} (1 - (1+i)^{N-1-n})',
    'formula_ic_n_from_IPi': 'n = \\frac{\\log(\\frac{I}{P} + 1)}{\\log(1 + i)}',
    'formula_ic_i_from_IPn': 'i = \\left(\\frac{I}{P} + 1\\right)^{\\frac{1}{n}} - 1',
    'formula_ic_j_from_SPnm': 'j = m \\left[ \\left(\\frac{S}{P}\\right)^{\\frac{1}{n}} - 1 \\right]',
    'formula_drs_D_from_Sjn': 'D = \\frac{S \\cdot j \\cdot n}{1 + j \\cdot n}',
    'formula_dbs_S_from_DBdn': 'S = \\frac{D_{B}}{d \\cdot n}',
    'formula_dbs_d_from_DBSn': 'd = \\frac{D_{B}}{S \\cdot n}',
    'formula_dbs_n_from_DBSd': 'n = \\frac{D_{B}}{S \\cdot d}',
    'formula_db_n_from_DBSde': 'n = \\frac{\\log(1 - \\frac{D_{B}}{S})}{\\log(1 - de)}',
    'formula_adv_n_from_PRik': 'n = -\\frac{\\log(1 - \\frac{P(1+i)^{k} i}{R})}{\\log(1 + i)}',
    'formula_adv_k_from_PRin': 'k = \\frac{\\log(\\frac{R(1-(1+i)^{-n})}{P i})}{\\log(1+i)}',
    'formula_ga_R_from_Gin': 'R_{eq} = G \\left[ \\frac{1}{i} - \\frac{n}{(1+i)^{n} - 1} \\right]',
};