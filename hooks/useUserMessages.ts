
import { useState, useEffect, useCallback, useMemo } from 'react';
import type { BroadcastMessage, User } from '../types';

const GLOBAL_READ_MESSAGES_KEY = 'finanCalcGlobalReadMessages';

export const useUserMessages = (allBroadcasts: BroadcastMessage[], currentUser: User | null) => {
    
    const [readMessages, setReadMessages] = useState<string[]>(() => {
        try {
            const storedRead = localStorage.getItem(GLOBAL_READ_MESSAGES_KEY);
            return storedRead ? JSON.parse(storedRead) : [];
        } catch (error) {
            return [];
        }
    });

     useEffect(() => {
        // Load messages when user changes. Since it's global, this just re-loads the same data.
        if (currentUser) {
            try {
                const storedRead = localStorage.getItem(GLOBAL_READ_MESSAGES_KEY);
                setReadMessages(storedRead ? JSON.parse(storedRead) : []);
            } catch (error) {
                setReadMessages([]);
            }
        } else {
             setReadMessages([]);
        }
    }, [currentUser]);

    useEffect(() => {
        localStorage.setItem(GLOBAL_READ_MESSAGES_KEY, JSON.stringify(readMessages));
    }, [readMessages]);
    
    const userBroadcasts = useMemo(() => {
        if (!currentUser) return [];
        return allBroadcasts
            .filter(msg => !msg.targetUserId || msg.targetUserId === currentUser.id)
            .sort((a, b) => b.timestamp - a.timestamp);
    }, [allBroadcasts, currentUser]);

    const unreadCount = useMemo(() => {
        return userBroadcasts.filter(msg => !readMessages.includes(msg.id)).length;
    }, [userBroadcasts, readMessages]);

    const markAsRead = useCallback((messageId: string) => {
        setReadMessages(prev => {
            if (prev.includes(messageId)) {
                return prev;
            }
            return [...prev, messageId];
        });
    }, []);

    return {
        readMessages,
        markAsRead,
        userBroadcasts,
        unreadCount
    };
};
