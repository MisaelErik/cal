import React from 'react';
import { PRO_CONTACT_EMAIL } from '../constants';

interface ProModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProModal: React.FC<ProModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" aria-modal="true" role="dialog" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all" onClick={e => e.stopPropagation()}>
        <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                 <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H4.5A2.25 2.25 0 002.25 12v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
            </div>
            <h3 className="mt-4 text-2xl font-bold text-slate-900 dark:text-slate-100">Función Pro Requerida</h3>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
                Esta es una función exclusiva para usuarios Pro. ¡Actualiza tu cuenta para desbloquearla y acceder a todas las capacidades!
            </p>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
                type="button"
                onClick={onClose}
                className="w-full inline-flex justify-center rounded-md border border-slate-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-800 text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 dark:focus:ring-offset-slate-900 sm:text-sm"
            >
                Cerrar
            </button>
             <a 
                href={`mailto:${PRO_CONTACT_EMAIL}?subject=Quiero ser Pro en FinanCalc AI`}
                className="w-full inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
             >
                ¡Quiero ser Pro!
             </a>
        </div>
      </div>
    </div>
  );
};

export default ProModal;