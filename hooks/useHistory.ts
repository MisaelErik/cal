
import { useState, useEffect, useCallback } from 'react';
import type { HistoryItem, User, AppResult } from '../types';

const GLOBAL_HISTORY_KEY = 'finanCalcGlobalHistory';

export const useHistory = (currentUser: User | null) => {
    const [history, setHistory] = useState<HistoryItem[]>(() => {
        try {
            const storedHistory = localStorage.getItem(GLOBAL_HISTORY_KEY);
            return storedHistory ? JSON.parse(storedHistory) : [];
        } catch (error) {
            console.error('Failed to parse history from localStorage', error);
            return [];
        }
    });

    useEffect(() => {
        // This effect runs when the user logs in or out.
        // We reload the global history from storage when a user logs in.
        if (currentUser) {
            try {
                const storedHistory = localStorage.getItem(GLOBAL_HISTORY_KEY);
                setHistory(storedHistory ? JSON.parse(storedHistory) : []);
            } catch (error) {
                setHistory([]);
            }
        } else {
            // Clear history from view when logged out, but don't erase it from storage.
            setHistory([]);
        }
    }, [currentUser]);


    useEffect(() => {
        // Persist history to localStorage whenever it changes.
        try {
            localStorage.setItem(GLOBAL_HISTORY_KEY, JSON.stringify(history));
        } catch (error) {
            console.error("Failed to save history to localStorage", error);
        }
    }, [history]);

    const addHistoryItem = useCallback((itemData: { problemDescription: string; results: AppResult[] }) => {
        const newHistoryItem: HistoryItem = {
            id: `hist-${Date.now()}`,
            ...itemData,
            timestamp: Date.now(),
        };
        setHistory(prev => [newHistoryItem, ...prev].slice(0, 50)); // Keep last 50
    }, []);

    const clearHistory = useCallback(() => {
        setHistory([]);
    }, []);

    return { history, addHistoryItem, clearHistory };
};
