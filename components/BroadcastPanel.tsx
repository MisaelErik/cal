import React, { useEffect, useRef } from 'react';
import type { BroadcastMessage } from '../types';

interface BroadcastPanelProps {
    isOpen: boolean;
    onClose: () => void;
    messages: BroadcastMessage[];
    onMarkAsRead: (messageId: string) => void;
}

const BroadcastPanel: React.FC<BroadcastPanelProps> = ({ isOpen, onClose, messages, onMarkAsRead }) => {
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if(isOpen && messages.length > 0) {
            messages.forEach(msg => onMarkAsRead(msg.id));
        }
    }, [isOpen, messages, onMarkAsRead]);

    // Effect to handle clicks outside the panel to close it
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            ref={panelRef}
            className="absolute top-full left-0 sm:left-1/2 sm:-translate-x-1/2 mt-2 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-xl border dark:border-slate-700 z-50"
        >
            <div className="p-3 border-b dark:border-slate-700">
                <h4 className="font-semibold text-slate-800 dark:text-slate-100">Notificaciones</h4>
            </div>
            <div className="max-h-96 overflow-y-auto">
                {messages.length === 0 ? (
                    <p className="p-4 text-sm text-slate-500 dark:text-slate-400 text-center">No hay mensajes nuevos.</p>
                ) : (
                    <ul className="divide-y divide-slate-100 dark:divide-slate-700">
                        {messages.map(msg => (
                            <li key={msg.id} className="p-4">
                                <p className="text-sm text-slate-700 dark:text-slate-300">{msg.content}</p>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 text-right">
                                    {new Date(msg.timestamp).toLocaleString()}
                                </p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default BroadcastPanel;