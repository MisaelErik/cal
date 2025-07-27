
import React, { useState, useMemo } from 'react';
import { FORMULAS_BY_CATEGORY, VARIABLE_DESCRIPTIONS, FORMULA_LATEX_TEMPLATES } from '../constants';
import { executePlan } from '../services/calculationEngine';
import type { CalculationPlan, ExecutedStep, Notification } from '../types';
import FormattedFormula from './FormattedFormula';

interface ManualCalculatorProps {
    onShowNotification: (message: string, type?: Notification['type']) => void;
}

const InfoIcon: React.FC<{ text: string }> = ({ text }) => (
    <div className="relative inline-block ml-1 group">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <div className="absolute bottom-full left-1/2 z-20 w-64 p-2 mb-2 -translate-x-1/2 bg-slate-800 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            {text}
            <svg className="absolute text-slate-800 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
        </div>
    </div>
);

const formatNumberForLatex = (num: number | string): string => {
    if (typeof num !== 'number') return String(num);
    return String(Number(num.toFixed(8)));
};

const substituteInLatex = (latex: string, inputs: Record<string, any>): string => {
    let substitutedLatex = latex;
    for (const [key, value] of Object.entries(inputs)) {
        const numString = formatNumberForLatex(value);
        const replacement = (typeof value === 'number' && value < 0) ? `(${numString})` : numString;

        const keysToReplace = [key];
        if (key === 'S') keysToReplace.push('S_v', 'S_a');
        if (key === 'P') keysToReplace.push('P_v', 'P_a', 'P_adv', 'P_ada');
        if (key === 'D') keysToReplace.push('D_B');
        if (key === 'd') keysToReplace.push('d_e');
        if (key === 'i') keysToReplace.push('i_eq');
        if (key === 'n') keysToReplace.push('n_dias');
        if (key === 'R') keysToReplace.push('R_eq');

        for (const k of keysToReplace) {
            const regex = new RegExp(`\\b${k}\\b`, 'g');
            substitutedLatex = substitutedLatex.replace(regex, replacement);
        }
    }
    return substitutedLatex;
};


const ManualCalculator: React.FC<ManualCalculatorProps> = ({ onShowNotification }) => {
    const [selectedCategory, setSelectedCategory] = useState<string>(Object.keys(FORMULAS_BY_CATEGORY)[0]);
    const [selectedFormulaName, setSelectedFormulaName] = useState<string>(FORMULAS_BY_CATEGORY[selectedCategory as keyof typeof FORMULAS_BY_CATEGORY][0].name);
    const [inputs, setInputs] = useState<Record<string, string>>({});
    const [result, setResult] = useState<ExecutedStep[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showPrettyFormulas, setShowPrettyFormulas] = useState(true);

    // State for rate converter
    const [rateConverter, setRateConverter] = useState({
        rate: '',
        fromPeriod: '30',
        toPeriod: '360',
        result: null as number | null
    });
    const [converterError, setConverterError] = useState<string | null>(null);

    const PERIODS: Record<string, string> = {
        '1': 'Diaria (TED)', '15': 'Quincenal', '30': 'Mensual (TEM)', '60': 'Bimestral', '90': 'Trimestral (TET)', '120': 'Cuatrimestral', '180': 'Semestral', '360': 'Anual (TEA)'
    };

    const selectedFormula = useMemo(() => {
        return FORMULAS_BY_CATEGORY[selectedCategory as keyof typeof FORMULAS_BY_CATEGORY].find(f => f.name === selectedFormulaName);
    }, [selectedCategory, selectedFormulaName]);
    
    const selectedFormulaTemplate = useMemo(() => {
        if (!selectedFormula) return null;
        const template = FORMULA_LATEX_TEMPLATES[selectedFormula.formula];
        if (!template) {
            console.error(`ManualCalculator: Missing LaTeX template for formula "${selectedFormula.formula}".`);
        }
        return template;
    }, [selectedFormula]);

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newCategory = e.target.value;
        setSelectedCategory(newCategory);
        const newFormulaName = FORMULAS_BY_CATEGORY[newCategory as keyof typeof FORMULAS_BY_CATEGORY][0].name;
        setSelectedFormulaName(newFormulaName);
        setInputs({});
        setResult(null);
        setError(null);
    };

    const handleFormulaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedFormulaName(e.target.value);
        setInputs({});
        setResult(null);
        setError(null);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setInputs(prev => ({ ...prev, [name]: value }));
    };

    const handleCalculate = () => {
        if (!selectedFormula) return;
        setError(null);
        setResult(null);

        try {
            const numericInputs: Record<string, number> = {};
            let allInputsValid = true;
            selectedFormula.inputs.forEach(inputKey => {
                const value = parseFloat(inputs[inputKey]);
                if (isNaN(value)) {
                    allInputsValid = false;
                }
                numericInputs[inputKey] = value;
            });

            if (!allInputsValid) {
                throw new Error("Por favor, ingrese valores numéricos válidos para todas las entradas.");
            }

            const plan: CalculationPlan = {
                interpretation: `Cálculo manual de: ${selectedFormula.name}`,
                initial_data: numericInputs,
                final_target_variable: selectedFormula.output,
                calculation_steps: [{
                    step_name: selectedFormula.name,
                    target_variable: selectedFormula.output,
                    formula_name: selectedFormula.formula,
                    inputs: numericInputs,
                }],
            };

            const executedSteps = executePlan(plan);
            setResult(executedSteps);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Ocurrió un error al calcular.");
        }
    };
    
    const formatNumberForDisplay = (num: number | string, options: Intl.NumberFormatOptions = { maximumFractionDigits: 6 }) => {
        if (typeof num !== 'number') return num;
        if (Math.abs(num) < 0.00001 && num !== 0) return num.toExponential(4);
        return num.toLocaleString('en-US', options);
    };

    const handleConverterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setRateConverter(prev => ({ ...prev, [name]: value }));
    };

    const handleConvertRate = () => {
        setConverterError(null);
        const rate = parseFloat(rateConverter.rate);
        const fromDays = parseInt(rateConverter.fromPeriod, 10);
        const toDays = parseInt(rateConverter.toPeriod, 10);

        if (isNaN(rate) || rate < 0) {
            setConverterError("Por favor, ingrese una tasa válida.");
            return;
        }

        const i_conocida = rate / 100;
        const convertedRate = (Math.pow(1 + i_conocida, toDays / fromDays) - 1) * 100;
        setRateConverter(prev => ({ ...prev, result: convertedRate }));
    };

    return (
        <div className="bg-white dark:bg-slate-800/50 dark:border dark:border-slate-700 p-6 sm:p-8 rounded-xl shadow-md space-y-8">
            <div>
                <h2 className="text-2xl font-bold mb-4">Calculadora Manual</h2>
                <p className="text-slate-600 dark:text-slate-400">Seleccione una fórmula, ingrese los datos y calcule sin usar IA. No consume créditos.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="category-select" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Categoría</label>
                    <select id="category-select" value={selectedCategory} onChange={handleCategoryChange} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800">
                        {Object.keys(FORMULAS_BY_CATEGORY).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="formula-select" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Fórmula a Calcular</label>
                    <select id="formula-select" value={selectedFormulaName} onChange={handleFormulaChange} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800">
                        {FORMULAS_BY_CATEGORY[selectedCategory as keyof typeof FORMULAS_BY_CATEGORY].map(f => <option key={f.name} value={f.name}>{f.name}</option>)}
                    </select>
                </div>
            </div>

            {selectedFormula && (
                <div className="dark-formula-container bg-slate-900 text-white dark:bg-black/50 p-4 rounded-lg border dark:border-slate-700">
                    <h3 className="text-base font-semibold text-center text-slate-200 dark:text-slate-300 mb-2">Fórmula Seleccionada</h3>
                    <div className="text-center">
                         {selectedFormulaTemplate ? (
                            <FormattedFormula latex={selectedFormulaTemplate} className="text-xl"/>
                        ) : (
                            <p className="text-red-400 font-mono text-sm">Fórmula no encontrada</p>
                        )}
                    </div>
                </div>
            )}

            {selectedFormula && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Datos de Entrada:</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {selectedFormula.inputs.map(inputKey => (
                            <div key={inputKey}>
                                <label htmlFor={inputKey} className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-300 capitalize">
                                    {inputKey.replace(/_/g, ' ')}
                                    {VARIABLE_DESCRIPTIONS[inputKey] && <InfoIcon text={VARIABLE_DESCRIPTIONS[inputKey]} />}
                                </label>
                                <input
                                    type="number"
                                    id={inputKey}
                                    name={inputKey}
                                    value={inputs[inputKey] || ''}
                                    onChange={handleInputChange}
                                    placeholder={`Valor para ${inputKey}`}
                                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md"
                                />
                            </div>
                        ))}
                    </div>
                    <button onClick={handleCalculate} className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
                        Calcular
                    </button>
                </div>
            )}
            
            {error && <p className="text-red-500">{error}</p>}

            {result && (
                <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border dark:border-slate-700">
                    <h3 className="text-xl font-bold mb-4">Resultado del Cálculo</h3>
                    <div className="flex items-center justify-end mb-4">
                        <label className="text-sm font-medium mr-3">Vista:</label>
                        <div className="flex items-center bg-slate-200 dark:bg-slate-700 rounded-lg p-1">
                            <button onClick={() => setShowPrettyFormulas(true)} className={`px-3 py-1 text-sm rounded-md ${showPrettyFormulas ? 'bg-white dark:bg-slate-800 shadow' : ''}`}>Fórmula</button>
                            <button onClick={() => setShowPrettyFormulas(false)} className={`px-3 py-1 text-sm rounded-md ${!showPrettyFormulas ? 'bg-white dark:bg-slate-800 shadow' : ''}`}>Simple</button>
                        </div>
                    </div>
                    {(() => {
                        const resultTemplate = FORMULA_LATEX_TEMPLATES[result[0].formula_name];
                        if (!resultTemplate && showPrettyFormulas) {
                            console.error(`ManualCalculator: Missing LaTeX template for result formula "${result[0].formula_name}".`);
                        }
                        
                        return showPrettyFormulas ? (
                            <div className="dark-formula-container bg-slate-900 text-white dark:bg-black/50 p-4 rounded-lg">
                                <div className="text-center">
                                    {resultTemplate ? (
                                        <FormattedFormula latex={substituteInLatex(resultTemplate, result[0].inputs)} className="text-xl"/>
                                    ) : (
                                         <p className="text-red-400 font-mono text-sm">Fórmula no encontrada</p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="p-3 bg-slate-200 dark:bg-slate-700/50 rounded font-mono text-sm overflow-x-auto mb-4">
                                <span className="font-sans font-semibold">{result[0].target_variable} = </span>{result[0].substituted_formula}
                            </div>
                        );
                    })()}
                    <div className="text-center bg-blue-100 dark:bg-blue-900/50 p-4 rounded-lg mt-4">
                         <p className="text-lg font-semibold text-blue-800 dark:text-blue-200 capitalize">{selectedFormula?.output.replace(/_/g, ' ')} es:</p>
                         <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mt-2">{formatNumberForDisplay(result[0].result)}</p>
                    </div>
                </div>
            )}
            
             <div className="mt-12 pt-8 border-t dark:border-slate-700">
                <h3 className="text-xl font-bold mb-4">Herramienta Avanzada: Conversión de Tasas de Interés</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                        <label htmlFor="rate" className="block text-sm font-medium text-slate-600 dark:text-slate-300">Tasa de Interés (%)</label>
                        <input type="number" name="rate" id="rate" value={rateConverter.rate} onChange={handleConverterChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md" placeholder="Ej: 2.5"/>
                    </div>
                    <div>
                        <label htmlFor="fromPeriod" className="block text-sm font-medium text-slate-600 dark:text-slate-300">Convertir de:</label>
                        <select name="fromPeriod" id="fromPeriod" value={rateConverter.fromPeriod} onChange={handleConverterChange} className="mt-1 block w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800">
                            {Object.entries(PERIODS).map(([days, name]) => <option key={days} value={days}>{name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="toPeriod" className="block text-sm font-medium text-slate-600 dark:text-slate-300">a:</label>
                        <select name="toPeriod" id="toPeriod" value={rateConverter.toPeriod} onChange={handleConverterChange} className="mt-1 block w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800">
                             {Object.entries(PERIODS).map(([days, name]) => <option key={days} value={days}>{name}</option>)}
                        </select>
                    </div>
                </div>
                <button onClick={handleConvertRate} className="mt-4 w-full sm:w-auto px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700">
                    Convertir Tasa
                </button>
                {converterError && <p className="text-red-500 mt-2">{converterError}</p>}
                {rateConverter.result !== null && (
                    <div className="mt-4 bg-indigo-50 dark:bg-indigo-900/50 p-4 rounded-lg border border-indigo-200 dark:border-indigo-700 text-center">
                         <p className="text-lg font-semibold text-indigo-800 dark:text-indigo-200">Tasa Equivalente:</p>
                         <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">{formatNumberForDisplay(rateConverter.result, { minimumFractionDigits: 6, maximumFractionDigits: 6 })}%</p>
                         <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-2">
                            Una {PERIODS[rateConverter.fromPeriod]} del {rateConverter.rate}% equivale a una {PERIODS[rateConverter.toPeriod]} del {formatNumberForDisplay(rateConverter.result, { minimumFractionDigits: 6, maximumFractionDigits: 6 })}%.
                         </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManualCalculator;
