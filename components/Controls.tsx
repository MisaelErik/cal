
import React from 'react';
import type { Provider, Mode, UserRole } from '../types';

interface ControlsProps {
    provider: Provider;
    onProviderChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    mode: Mode;
    onModeChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    isLoading: boolean;
    userRole: UserRole;
}

const ProBadge: React.FC = () => (
    <span className="ml-2 text-xs font-bold text-indigo-700 bg-indigo-100 dark:bg-indigo-900 dark:text-indigo-300 px-2 py-0.5 rounded-full">
        PRO
    </span>
);

export const Controls: React.FC<ControlsProps> = ({ provider, onProviderChange, mode, onModeChange, isLoading, userRole }) => {
    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Provider Selection */}
                <div>
                    <label htmlFor="provider-select" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                        Proveedor de IA
                    </label>
                    <select
                        id="provider-select"
                        value={provider}
                        onChange={onProviderChange}
                        disabled={isLoading}
                        className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200 disabled:bg-slate-100 dark:disabled:bg-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    >
                        <option value="gemini_studio">Google AI Studio</option>
                        <option value="openrouter_kimi">OpenRouter (Kimi)</option>
                        <option value="openrouter_mistral">OpenRouter (Mistral)</option>
                        <option value="openrouter_geo">Geo (vía OpenRouter)</option>
                        <option value="openrouter_deepseek">OpenRouter (Deepseek)</option>
                        <option value="all">Todas las IAs (Comparativa)</option>
                    </select>
                     {userRole === 'free' && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            La comparación de IAs es una función <span className="font-bold text-indigo-600 dark:text-indigo-400">PRO</span>.
                        </p>
                    )}
                </div>
                {/* Mode Selection */}
                <div>
                     <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Modo de Cálculo</label>
                     <div className="flex items-center space-x-4 p-2 border border-slate-300 dark:border-slate-600 rounded-lg h-[42px]">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="radio"
                                name="mode"
                                value="preciso"
                                checked={mode === 'preciso'}
                                onChange={onModeChange}
                                disabled={isLoading}
                                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">Modo Preciso</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="radio"
                                name="mode"
                                value="experimental"
                                checked={mode === 'experimental'}
                                onChange={onModeChange}
                                disabled={isLoading}
                                className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                            />
                            <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">Modo Experimental</span>
                            {userRole === 'free' && <ProBadge />}
                        </label>
                     </div>
                </div>
            </div>
        </div>
    );
};
