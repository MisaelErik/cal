
import React, { useState } from 'react';

interface RedeemCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRedeem: (code: string) => void;
}

const RedeemCodeModal: React.FC<RedeemCodeModalProps> = ({ isOpen, onClose, onRedeem }) => {
  const [code, setCode] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
        onRedeem(code.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-8 max-w-md w-full transform transition-all" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Canjear Código</h3>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
                Ingresa un código promocional para recibir créditos o una suscripción Pro.
            </p>
            <div className="mt-4">
                <label htmlFor="code-input" className="sr-only">Código</label>
                <input
                    id="code-input"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Escribe tu código aquí"
                    className="w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 text-center font-mono uppercase"
                />
            </div>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                    type="button"
                    onClick={onClose}
                    className="w-full inline-flex justify-center rounded-md border border-slate-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-800 text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    className="w-full inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700"
                >
                    Canjear
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default RedeemCodeModal;
