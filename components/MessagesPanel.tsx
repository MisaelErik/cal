import React, { useState } from 'react';
import type { User, BroadcastMessage } from '../types';

interface MessagesPanelProps {
    users: User[];
    onAddBroadcast: (messageData: Omit<BroadcastMessage, 'id' | 'timestamp'>) => void;
}

const MessagesPanel: React.FC<MessagesPanelProps> = ({ users, onAddBroadcast }) => {
    const [content, setContent] = useState('');
    const [targetUserId, setTargetUserId] = useState('all');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) {
            alert('El mensaje no puede estar vacío.');
            return;
        }
        onAddBroadcast({
            content: content,
            targetUserId: targetUserId === 'all' ? undefined : targetUserId
        });
        // Reset form
        setContent('');
        setTargetUserId('all');
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-lg font-semibold">Enviar Mensaje a Usuarios</h3>
            <div>
                <label className="block text-sm font-medium mb-1">Mensaje</label>
                <textarea value={content} onChange={e => setContent(e.target.value)} required rows={4} className="w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600"></textarea>
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Destinatario</label>
                <select value={targetUserId} onChange={e => setTargetUserId(e.target.value)} className="w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600">
                    <option value="all">Todos los usuarios</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
                </select>
            </div>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">Enviar Mensaje</button>
        </form>
    );
}

export default MessagesPanel;