import { useState, useEffect, useCallback } from 'react';
import type { User, RedeemCode } from '../types';
import { defaultUsers } from '../data/db';

const USERS_STORAGE_KEY = 'finanCalcUsers';
const CURRENT_USER_ID_KEY = 'finanCalcCurrentUserId';

export const useUsers = () => {
    const [users, setUsers] = useState<User[]>(() => {
        try {
            const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
            if (storedUsers) {
                return JSON.parse(storedUsers);
            }
            const initialUsers = defaultUsers;
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initialUsers));
            return initialUsers;
        } catch (error) {
            console.error("Failed to parse users from localStorage", error);
            return defaultUsers;
        }
    });

    const [currentUser, setCurrentUser] = useState<User | null>(() => {
         try {
            const currentUserId = localStorage.getItem(CURRENT_USER_ID_KEY);
            if (currentUserId) {
                const user = users.find(u => u.id === currentUserId);
                return user || null;
            }
            return null;
        } catch (error) {
            console.error("Failed to get current user from localStorage", error);
            return null;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        } catch (error) {
            console.error("Failed to save users to localStorage", error);
        }
    }, [users]);
    
    const updateUserState = (updatedUser: User) => {
        setUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
        if (currentUser?.id === updatedUser.id) {
            setCurrentUser(updatedUser);
        }
    };

    const checkAndResetUser = useCallback((userId: string) => {
        const user = users.find(u => u.id === userId);
        if (!user) return;

        let userWasUpdated = false;
        let updatedUser = { ...user };

        // 1. Check for Pro expiration
        if (updatedUser.role === 'pro' && updatedUser.proExpiresAt) {
            const expirationDate = new Date(updatedUser.proExpiresAt);
            if (expirationDate < new Date()) {
                updatedUser.role = 'free';
                // Reset to default free credits config
                updatedUser.creditsConfig = { initialAmount: 10, renewalDays: 1 };
                updatedUser.credits = 10;
                updatedUser.proExpiresAt = undefined;
                userWasUpdated = true;
            }
        }

        // 2. Check for credit renewal
        if (updatedUser.role !== 'owner' && updatedUser.creditsConfig.renewalDays > 0) {
            const lastReset = new Date(updatedUser.lastCreditReset);
            const today = new Date();
            lastReset.setHours(0, 0, 0, 0);
            today.setHours(0, 0, 0, 0);
            const daysSinceLastReset = (today.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24);

            if (daysSinceLastReset >= updatedUser.creditsConfig.renewalDays) {
                updatedUser = {
                    ...updatedUser,
                    credits: updatedUser.creditsConfig.initialAmount,
                    lastCreditReset: new Date().toISOString()
                };
                userWasUpdated = true;
            }
        }
        
        if (userWasUpdated) {
            updateUserState(updatedUser);
        }
    }, [users]);

    const findUserByUsername = (username: string): User | undefined => {
        return users.find(user => user.username.toLowerCase() === username.trim().toLowerCase());
    };

    const login = (username: string, password: string): boolean => {
        const user = findUserByUsername(username);
        if (user && user.password === password) {
            setCurrentUser(user);
            localStorage.setItem(CURRENT_USER_ID_KEY, user.id);
            checkAndResetUser(user.id);
            return true;
        }
        return false;
    };
    
    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem(CURRENT_USER_ID_KEY);
    };
    
    const consumeCredit = (userId: string) => {
        const user = users.find(u => u.id === userId);
        if (!user || user.role === 'owner') return;

        const updatedUser = { ...user, credits: Math.max(0, user.credits - 1) };
        updateUserState(updatedUser);
    };

    const addUser = (userData: Omit<User, 'id' | 'credits' | 'lastCreditReset' | 'redeemedCodes'> & { proDurationDays?: number }) => {
        const trimmedUsername = userData.username.trim();
        if (!trimmedUsername) {
            throw new Error('El nombre de usuario no puede estar vacío.');
        }
        if (findUserByUsername(trimmedUsername)) {
            throw new Error('El nombre de usuario ya existe.');
        }
        const newUser: User = {
            username: trimmedUsername,
            password: userData.password,
            role: userData.role,
            creditsConfig: userData.creditsConfig,
            id: `user-${Date.now()}`,
            credits: userData.creditsConfig.initialAmount,
            lastCreditReset: new Date().toISOString(),
            redeemedCodes: [],
        };
        
        if (newUser.role === 'pro' && userData.proDurationDays) {
            const expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate() + userData.proDurationDays);
            newUser.proExpiresAt = expirationDate.toISOString();
        }
        
        setUsers(prev => [...prev, newUser]);
    };

    const updateUser = (userId: string, updatedData: Partial<User> & { proDurationDays?: number }) => {
        setUsers(prevUsers => prevUsers.map(u => {
            if (u.id === userId) {
                const { proDurationDays, ...restOfData } = updatedData;
                const updatedUser = { ...u, ...restOfData };
                
                if (updatedUser.role === 'pro' && proDurationDays !== undefined) {
                    const startDate = updatedUser.proExpiresAt && new Date(updatedUser.proExpiresAt) > new Date()
                        ? new Date(updatedUser.proExpiresAt)
                        : new Date();
                    startDate.setDate(startDate.getDate() + proDurationDays);
                    updatedUser.proExpiresAt = startDate.toISOString();
                } else if (updatedUser.role === 'free') {
                    updatedUser.proExpiresAt = undefined;
                }
                
                return updatedUser;
            }
            return u;
        }));
    };

    const deleteUser = (userId: string) => {
        setUsers(prevUsers => prevUsers.filter(u => u.id !== userId && u.role !== 'owner'));
    };
    
    const applyCodeRewards = (userId: string, code: RedeemCode) => {
        const user = users.find(u => u.id === userId);
        if (!user) return;
        
        let updatedUser = { ...user };
        
        // Add credits
        if (code.rewards.credits > 0) {
            updatedUser.credits += code.rewards.credits;
        }
        
        // Add pro days
        if (code.rewards.proDays > 0) {
            const startDate = updatedUser.proExpiresAt && new Date(updatedUser.proExpiresAt) > new Date()
                ? new Date(updatedUser.proExpiresAt)
                : new Date();
            startDate.setDate(startDate.getDate() + code.rewards.proDays);
            updatedUser.proExpiresAt = startDate.toISOString();
            
            // If they were free, make them pro
            if (updatedUser.role === 'free') {
                updatedUser.role = 'pro';
            }
        }
        
        // Mark code as redeemed
        updatedUser.redeemedCodes = [...(updatedUser.redeemedCodes || []), code.id];

        updateUserState(updatedUser);
    };


    return {
        users,
        currentUser,
        setCurrentUser,
        login,
        logout,
        addUser,
        updateUser,
        deleteUser,
        consumeCredit,
        checkAndResetUser,
        applyCodeRewards,
    };
};