
import { useState, useEffect, useCallback } from 'react';
import type { RedeemCode } from '../types';
import { defaultCodes } from '../data/db';

const CODES_STORAGE_KEY = 'finanCalcRedeemCodes';

export const useCodes = () => {
    const [codes, setCodes] = useState<RedeemCode[]>(() => {
        try {
            const storedCodes = localStorage.getItem(CODES_STORAGE_KEY);
            if (storedCodes) {
                return JSON.parse(storedCodes);
            }
            const initialCodes = defaultCodes;
            localStorage.setItem(CODES_STORAGE_KEY, JSON.stringify(initialCodes));
            return initialCodes;
        } catch (error) {
            console.error('Failed to parse or set codes in localStorage', error);
            return defaultCodes;
        }
    });

    useEffect(() => {
        localStorage.setItem(CODES_STORAGE_KEY, JSON.stringify(codes));
    }, [codes]);

    const addCode = (codeData: Omit<RedeemCode, 'id' | 'usersWhoRedeemed'>) => {
        const newCode: RedeemCode = {
            ...codeData,
            id: `code-${Date.now()}`,
            usersWhoRedeemed: [],
        };
        setCodes(prev => [...prev, newCode]);
    };

    const deleteCode = (codeId: string) => {
        setCodes(prev => prev.filter(c => c.id !== codeId));
    };

    const redeemCode = useCallback((codeString: string, userId: string): RedeemCode => {
        const code = codes.find(c => c.code.toLowerCase() === codeString.toLowerCase());

        if (!code) {
            throw new Error('El código ingresado no existe.');
        }

        if (code.maxUses > 0 && code.usersWhoRedeemed.length >= code.maxUses) {
            throw new Error('Este código ha alcanzado su límite de usos.');
        }

        if (code.usersWhoRedeemed.includes(userId)) {
            throw new Error('Ya has canjeado este código anteriormente.');
        }

        // The code is valid for this user, so update it.
        const updatedCode = {
            ...code,
            usersWhoRedeemed: [...code.usersWhoRedeemed, userId],
        };

        setCodes(prevCodes => prevCodes.map(c => c.id === code.id ? updatedCode : c));

        // Return the original code object for reward processing
        return code;

    }, [codes]);

    return { codes, addCode, deleteCode, redeemCode };
};