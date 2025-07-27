import React from 'react';
import type { HistoryItem } from '../types';

interface HistoryPanelProps {
    history: HistoryItem[];
    onSelect: (item: HistoryItem) => void;
    onClear: () => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onSelect, onClear }) => {
    return (
        <div className="bg-white dark:bg-slate-800/50 dark:border dark:border-slate-700 p-6 sm:p-8 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-6 border-b dark:border-slate-600 pb-4">
                <h2 className="text-2xl font-bold">Historial de Problemas</h2>
                {history.length > 0 && (
                    <button
                        onClick={() => window.confirm('¿Seguro que quieres borrar todo el historial?') && onClear()}
                        className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Borrar Historial
                    </button>
                )}
            </div>

            {history.length === 0 ? (
                <p className="text-center text-slate-500 dark:text-slate-400 py-8">No hay problemas en tu historial.</p>
            ) : (
                <ul className="space-y-4">
                    {history.map(item => (
                        <li key={item.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        {new Date(item.timestamp).toLocaleString()}
                                    </p>
                                    <p className="font-semibold text-slate-800 dark:text-slate-100 truncate mt-1">
                                        {item.problemDescription}
                                    </p>
                                </div>
                                <div className="mt-4 sm:mt-0 sm:ml-4">
                                     <button
                                        onClick={() => onSelect(item)}
                                        className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
                                    >
                                        Ver Resultado
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default HistoryPanel;
