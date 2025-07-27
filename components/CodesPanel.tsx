import React, { useState } from 'react';
import type { RedeemCode } from '../types';

interface CodesPanelProps {
    codes: RedeemCode[];
    onAddCode: (codeData: Omit<RedeemCode, 'id' | 'usersWhoRedeemed'>) => void;
    onDeleteCode: (codeId: string) => void;
}

const CodesPanel: React.FC<CodesPanelProps> = ({ codes, onAddCode, onDeleteCode }) => {
    const [code, setCode] = useState('');
    const [credits, setCredits] = useState('');
    const [proDays, setProDays] = useState('');
    const [maxUses, setMaxUses] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!code.trim()) {
            alert('El campo de código es obligatorio.');
            return;
        }
        onAddCode({
            code: code.trim(),
            rewards: {
                credits: Number(credits) || 0,
                proDays: Number(proDays) || 0
            },
            maxUses: Number(maxUses) || 0,
        });
        // Reset form
        setCode('');
        setCredits('');
        setProDays('');
        setMaxUses('');
    };

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="p-4 border dark:border-slate-600 rounded-lg space-y-4">
                <h3 className="text-lg font-semibold">Crear Nuevo Código</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Código (ej: PROMO2024)" required className="w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600"/>
                    <input value={credits} onChange={(e) => setCredits(e.target.value)} type="number" min="0" placeholder="Créditos a dar" className="w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600"/>
                    <input value={proDays} onChange={(e) => setProDays(e.target.value)} type="number" min="0" placeholder="Días Pro a dar" className="w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600"/>
                    <input value={maxUses} onChange={(e) => setMaxUses(e.target.value)} type="number" min="0" placeholder="Usos máx. (0=infinito)" className="w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600"/>
                </div>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700">Crear Código</button>
            </form>
            <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                        <tr>
                            <th className="px-6 py-3">Código</th>
                            <th className="px-6 py-3">Recompensa</th>
                            <th className="px-6 py-3">Usos</th>
                            <th className="px-6 py-3">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {codes.map(code => (
                            <tr key={code.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700">
                                <td className="px-6 py-4 font-mono text-slate-900 dark:text-white">{code.code}</td>
                                <td className="px-6 py-4">{`${code.rewards.credits} créditos, ${code.rewards.proDays} días Pro`}</td>
                                <td className="px-6 py-4">{`${code.usersWhoRedeemed.length} / ${code.maxUses === 0 ? '∞' : code.maxUses}`}</td>
                                <td className="px-6 py-4">
                                    <button onClick={() => onDeleteCode(code.id)} className="font-medium text-red-600 hover:underline">Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CodesPanel;