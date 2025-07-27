
import React, { useRef, useState } from 'react';
import type { CalculationPlan, ExecutedStep, UserRole, Notification } from '../types';
import { FORMULA_LATEX_TEMPLATES } from '../constants';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import FormattedFormula from './FormattedFormula';


interface ResultsDisplayProps {
    problemDescription: string;
    plan: CalculationPlan;
    executedSteps: ExecutedStep[];
    userRole: UserRole;
    onShowNotification: (message: string, type?: Notification['type']) => void;
    onUpgradeToPro: () => void;
}

const formatNumber = (num: number | string) => {
    if (typeof num !== 'number') return num;
    if (num === 0) return '0';
    if (Math.abs(num) < 0.00001 || Math.abs(num) > 1e12) {
        return num.toExponential(4);
    }
    // Round to a reasonable number of decimal places for display
    const rounded = Number(num.toFixed(8));
    if (Number.isInteger(rounded)) {
        return rounded.toLocaleString('en-US');
    }
    return rounded.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 8,
    });
};

/**
 * Formats a number into a string suitable for LaTeX, avoiding commas.
 */
const formatNumberForLatex = (num: number | string): string => {
    if (typeof num !== 'number') return String(num);
    // Return number as string, fixed to 8 decimal places and trailing zeros removed.
    // This avoids both commas and scientific notation that might break LaTeX.
    return String(Number(num.toFixed(8)));
};

const generateFormulaUrl = (latex: string): string => {
    const rawLatex = `\\dpi{150} \\color{white} ${latex}`;
    const encodedLatex = encodeURIComponent(rawLatex);
    return `https://latex.codecogs.com/png.image?${encodedLatex}`;
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md dark:border dark:border-slate-700">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 border-b dark:border-slate-600 pb-3">{title}</h2>
        {children}
    </div>
);


const FinalResultCard: React.FC<{ final_target_variable: string; result?: number | string }> = ({ final_target_variable, result }) => {
    if (result === undefined) return null;
    return (
        <Section title="Resultado Final">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-800 text-white p-6 rounded-lg text-center">
                <p className="text-lg mb-2 capitalize">{final_target_variable.replace(/_/g, ' ')}</p>
                <div className="text-4xl md:text-5xl font-extrabold bg-white dark:bg-slate-900/50 text-blue-700 dark:text-white rounded-lg py-3 px-5 inline-block break-all">
                    {formatNumber(result)}
                </div>
            </div>
        </Section>
    );
};

const FeatureLockCard: React.FC<{ onUpgrade: () => void; featureName: string; }> = ({ onUpgrade, featureName }) => (
    <div className="text-center p-6 bg-slate-100 dark:bg-slate-900/40 rounded-lg my-4 border-2 border-dashed border-slate-300 dark:border-slate-700">
        <h3 className="font-bold text-slate-800 dark:text-slate-200">Función Pro: {featureName}</h3>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Actualiza a Pro para ver esta sección y obtener un análisis más detallado.
        </p>
        <button
            onClick={onUpgrade}
            className="mt-3 text-sm bg-indigo-600 text-white font-bold py-1.5 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
        >
            ¡Actualizar a Pro!
        </button>
    </div>
);

const substituteInLatex = (latex: string, inputs: Record<string, any>): string => {
    let substitutedLatex = latex;
    for (const [key, value] of Object.entries(inputs)) {
        const numString = formatNumberForLatex(value);
        
        // Wrap negative numbers in parentheses for clarity in the formula
        const replacement = (typeof value === 'number' && value < 0) ? `(${numString})` : numString;

        const keysToReplace = [key];
        // Handle descriptive variables like S_v, P_a by mapping from base variables S, P
        if (key === 'S') keysToReplace.push('S_v', 'S_a');
        if (key === 'P') keysToReplace.push('P_v', 'P_a', 'P_adv', 'P_ada');
        if (key === 'D') keysToReplace.push('D_B');
        if (key === 'd') keysToReplace.push('d_e');
        if (key === 'i') keysToReplace.push('i_eq');
        if (key === 'n') keysToReplace.push('n_dias');
        if (key === 'R') keysToReplace.push('R_eq');
        
        for (const k of keysToReplace) {
             // Use \b for word boundaries to avoid replacing parts of other variables
            const regex = new RegExp(`\\b${k}\\b`, 'g');
            // Do not wrap the replacement in braces, as it causes issues with \frac, etc.
            // The templates themselves should have braces where needed (e.g., for exponents).
            substitutedLatex = substitutedLatex.replace(regex, replacement);
        }
    }
    
    return substitutedLatex;
};


const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ problemDescription, plan, executedSteps, userRole, onShowNotification, onUpgradeToPro }) => {
    const { interpretation, initial_data, final_target_variable } = plan;
    const finalResult = executedSteps.find(step => step.target_variable === final_target_variable)?.result;
    const resultsRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = React.useState(false);
    const [showPrettyFormulas, setShowPrettyFormulas] = useState(true);

    const isPro = userRole === 'pro' || userRole === 'owner';

    const handleDownloadPdf = async () => {
        const content = resultsRef.current;
        if (!content) return;

        setIsDownloading(true);
        onShowNotification('Generando PDF, por favor espere...', 'info');
        
        try {
            const canvas = await html2canvas(content, {
                scale: 2,
                useCORS: true, // Allow fetching cross-origin images
                backgroundColor: document.body.classList.contains('dark') ? '#0f172a' : '#f8fafc',
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'p',
                unit: 'mm',
                format: 'a4'
            });

            const margin = 10;
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            
            const ratio = canvasWidth / canvasHeight;
            const pdfImageWidth = pdfWidth - (margin * 2);
            const pdfImageHeight = pdfImageWidth / ratio;
            
            const pageContentHeight = pageHeight - (margin * 2);
            
            let position = margin;

            // Add the first page
            pdf.addImage(imgData, 'PNG', margin, position, pdfImageWidth, pdfImageHeight);
            
            let heightLeft = pdfImageHeight - pageContentHeight;

            while (heightLeft > 0) {
                position -= pageContentHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', margin, position, pdfImageWidth, pdfImageHeight);
                heightLeft -= pageContentHeight;
            }
            
            pdf.save(`FinanCalc-AI-Solucion-${Date.now()}.pdf`);
            onShowNotification('PDF descargado correctamente.', 'success');
        } catch (error) {
            console.error("Error generating PDF:", error);
            onShowNotification('Error al generar el PDF.', 'error');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="space-y-8">
             <div className="flex justify-end">
                <button
                    onClick={handleDownloadPdf}
                    disabled={isDownloading}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-slate-400 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    {isDownloading ? 'Generando...' : 'Descargar como PDF'}
                </button>
            </div>
            <div ref={resultsRef} className="space-y-8 p-4 bg-slate-50 dark:bg-slate-900">
                <Section title="Problema">
                     <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{problemDescription}</p>
                 </Section>

                <Section title="Interpretación de la IA">
                    <p className="text-slate-600 dark:text-slate-300 italic">"{interpretation}"</p>
                </Section>
                
                <Section title="Datos Extraídos">
                    <ul className="space-y-3">
                        {Object.entries(initial_data).map(([key, value]) => (
                            <li key={key} className="flex justify-between items-center text-sm">
                                <span className="font-semibold text-slate-700 dark:text-slate-200 capitalize">{key.replace(/_/g, ' ')}:</span>
                                <span className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-mono py-1 px-2 rounded">{String(value)}</span>
                            </li>
                        ))}
                    </ul>
                </Section>
                
                <Section title="Fórmulas a Usar">
                    {isPro ? (
                         <ul className="space-y-4">
                            {plan.calculation_steps.map((step, index) => {
                                const latexTemplate = FORMULA_LATEX_TEMPLATES[step.formula_name];
                                if (!latexTemplate) {
                                    console.error(`ResultsDisplay: Missing LaTeX template for formula "${step.formula_name}" in 'Fórmulas a Usar' section.`);
                                }
                                const formulaUrl = latexTemplate ? generateFormulaUrl(latexTemplate) : '';
                                return (
                                    <li key={index}>
                                         <div className="dark-formula-container bg-slate-900 text-white dark:bg-black/50 p-4 rounded-lg text-center">
                                            {latexTemplate ? (
                                                <FormattedFormula latex={latexTemplate} className="text-xl"/>
                                            ) : (
                                                <p className="text-red-400 font-mono text-sm">Fórmula no encontrada</p>
                                            )}
                                        </div>
                                        {userRole === 'owner' && formulaUrl && (
                                            <div className="mt-2 text-center">
                                                <a href={formulaUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-400 hover:text-blue-400 break-all font-mono">
                                                    {formulaUrl}
                                                </a>
                                            </div>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <FeatureLockCard onUpgrade={onUpgradeToPro} featureName="Visualización de Fórmulas"/>
                    )}
                </Section>

                <Section title="Resolución Paso a Paso">
                    {isPro && (
                        <div className="flex items-center justify-end mb-4">
                            <label className="text-sm font-medium mr-3">Vista:</label>
                            <div className="flex items-center bg-slate-200 dark:bg-slate-700 rounded-lg p-1">
                                <button onClick={() => setShowPrettyFormulas(true)} className={`px-3 py-1 text-sm rounded-md ${showPrettyFormulas ? 'bg-white dark:bg-slate-800 shadow' : ''}`}>Fórmula</button>
                                <button onClick={() => setShowPrettyFormulas(false)} className={`px-3 py-1 text-sm rounded-md ${!showPrettyFormulas ? 'bg-white dark:bg-slate-800 shadow' : ''}`}>Simple</button>
                            </div>
                        </div>
                    )}
                    <div className="space-y-6">
                        {executedSteps.map((step, index) => {
                             const latexForStep = FORMULA_LATEX_TEMPLATES[step.formula_name];
                             if (isPro && showPrettyFormulas && !latexForStep) {
                                 console.error(`ResultsDisplay: Missing LaTeX template for formula "${step.formula_name}" in 'Resolución Paso a Paso' for Step ${index + 1}.`);
                             }
                             const prettyFormulaLatex = latexForStep ? substituteInLatex(latexForStep, step.inputs) : '';
                             
                             return (
                                <div key={index} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                    <p className="font-bold text-slate-700 dark:text-slate-200">Paso {index + 1}: {step.step_name}</p>
                                    <div className="mt-3 text-sm space-y-2">
                                        {isPro && showPrettyFormulas ? (
                                            <div className="dark-formula-container bg-slate-900 text-white dark:bg-black/50 p-4 rounded-lg">
                                                <div className="text-center">
                                                    {prettyFormulaLatex ? (
                                                        <>
                                                            <FormattedFormula latex={prettyFormulaLatex} className="text-xl"/>
                                                            {userRole === 'owner' && (
                                                                <div className="mt-2">
                                                                    <a 
                                                                        href={generateFormulaUrl(prettyFormulaLatex)} 
                                                                        target="_blank" 
                                                                        rel="noopener noreferrer" 
                                                                        className="text-xs text-slate-400 hover:text-blue-400 break-all font-mono"
                                                                    >
                                                                        {generateFormulaUrl(prettyFormulaLatex)}
                                                                    </a>
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <p className="text-red-400 font-mono text-sm">Fórmula no encontrada</p>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-3 bg-slate-200 dark:bg-slate-700/50 rounded font-mono text-xs overflow-x-auto">
                                                <span className="font-sans font-semibold">{step.target_variable} = </span>{step.substituted_formula}
                                            </div>
                                        )}
                                        <div className="text-right pt-2">
                                            <span className="font-bold text-lg">{step.target_variable} = </span>
                                            <span className="font-bold text-lg bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 py-1 px-3 rounded-md">{formatNumber(step.result)}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Section>

                <FinalResultCard final_target_variable={final_target_variable} result={finalResult} />
            </div>
        </div>
    );
};

export default ResultsDisplay;
