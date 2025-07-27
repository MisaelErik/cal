
import { useState, useEffect } from 'react';
import type { BroadcastMessage } from '../types';
import { defaultBroadcasts } from '../data/db';

const BROADCASTS_STORAGE_KEY = 'finanCalcBroadcasts';

export const useBroadcasts = () => {
    const [broadcasts, setBroadcasts] = useState<BroadcastMessage[]>(() => {
        try {
            const storedBroadcasts = localStorage.getItem(BROADCASTS_STORAGE_KEY);
            if (storedBroadcasts) {
                return JSON.parse(storedBroadcasts);
            }
            const initialBroadcasts = defaultBroadcasts;
            localStorage.setItem(BROADCASTS_STORAGE_KEY, JSON.stringify(initialBroadcasts));
            return initialBroadcasts;
        } catch (error) {
            console.error('Failed to parse broadcasts from localStorage', error);
            return defaultBroadcasts;
        }
    });

    useEffect(() => {
        localStorage.setItem(BROADCASTS_STORAGE_KEY, JSON.stringify(broadcasts));
    }, [broadcasts]);

    const addBroadcast = (messageData: Omit<BroadcastMessage, 'id' | 'timestamp'>) => {
        const newMessage: BroadcastMessage = {
            ...messageData,
            id: `msg-${Date.now()}`,
            timestamp: Date.now(),
        };
        setBroadcasts(prev => [newMessage, ...prev]);
    };

    return { broadcasts, addBroadcast };
};