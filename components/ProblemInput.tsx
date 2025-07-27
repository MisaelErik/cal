
import React, { useRef } from 'react';
import type { UserRole } from '../types';

interface ProblemInputProps {
    value: string;
    onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onCalculate: () => void;
    onImageUpload: (file: File) => void;
    isLoading: boolean;
    isOcrLoading: boolean;
    credits: number;
    userRole: UserRole;
    onStop: () => void;
}

const ImageIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500 group-hover:text-blue-600 dark:text-slate-400 dark:group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const OcrSpinner: React.FC = () => (
    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
);

const ProblemInput: React.FC<ProblemInputProps> = ({ value, onChange, onCalculate, onImageUpload, isLoading, isOcrLoading, credits, userRole, onStop }) => {
    const hasNoCredits = userRole === 'free' && credits <= 0;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleIconClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onImageUpload(file);
            e.target.value = ''; // Reset file input
        }
    };

    return (
        <div className="mt-6">
            <label htmlFor="problem-textarea" className="sr-only">
                Describa su problema financiero
            </label>
            <div className="relative">
                <textarea
                    id="problem-textarea"
                    className="w-full h-36 p-4 pr-12 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200 resize-y bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    placeholder="Escriba su problema aquí, o suba una imagen del mismo usando el ícono ->"
                    value={value}
                    onChange={onChange}
                    disabled={isLoading || isOcrLoading}
                />
                <div className="absolute right-3 top-3 flex items-center">
                    {isOcrLoading ? <OcrSpinner /> : (
                         <button 
                            type="button" 
                            onClick={handleIconClick}
                            disabled={isLoading || isOcrLoading}
                            aria-label="Subir imagen del problema"
                            className="group p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 disabled:cursor-not-allowed"
                         >
                            <ImageIcon />
                        </button>
                    )}
                </div>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange}
                    accept="image/png, image/jpeg, image/webp"
                    hidden
                />
            </div>
            <button
                onClick={isLoading ? onStop : onCalculate}
                disabled={isOcrLoading || (!isLoading && (!value || hasNoCredits))}
                className={`mt-4 w-full flex justify-center items-center gap-x-3 font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200
                    ${isLoading 
                        ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500' 
                        : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                    }
                    disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed`
                }
            >
                {isLoading ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Parar Cálculo</span>
                    </>
                ) : hasNoCredits ? (
                    'Sin Créditos'
                ) : (
                    'Resolver con IA (-1 Crédito)'
                )}
            </button>
            <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-2">
                {hasNoCredits 
                    ? 'Tus créditos se renuevan periódicamente.' 
                    : 'Coloque solo un problema a la vez para obtener mejores resultados.'
                }
            </p>
        </div>
    );
};

export default ProblemInput;