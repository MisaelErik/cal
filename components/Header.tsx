
import React, { useState, useEffect, useRef } from 'react';
import type { User, BroadcastMessage } from '../types';
import BroadcastPanel from './BroadcastPanel';

interface HeaderProps {
    user: User | null;
    onLogout: () => void;
    onRedeemCodeClick: () => void;
    unreadMessagesCount: number;
    broadcasts: BroadcastMessage[];
    onMarkMessageAsRead: (messageId: string) => void;
    onToggleSidebar: () => void;
}

const ProDaysDisplay: React.FC<{ expiresAt?: string }> = ({ expiresAt }) => {
    if (!expiresAt) return null;
    
    const [daysLeft, setDaysLeft] = useState(0);

    useEffect(() => {
        const expiration = new Date(expiresAt);
        const now = new Date();
        const diff = expiration.getTime() - now.getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        setDaysLeft(days > 0 ? days : 0);
    }, [expiresAt]);

    if (daysLeft <= 0) return null;

    return (
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">{daysLeft} día{daysLeft !== 1 ? 's' : ''} restantes de Pro</span>
        </div>
    );
};


const Header: React.FC<HeaderProps> = ({ user, onLogout, onRedeemCodeClick, unreadMessagesCount, broadcasts, onMarkMessageAsRead, onToggleSidebar }) => {
    if (!user) return null;
    
    const [isBroadcastPanelOpen, setIsBroadcastPanelOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
                setIsBroadcastPanelOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const roleColors: Record<User['role'], string> = {
        owner: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
        pro: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
        free: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    };
    
    const handleBellClick = () => {
        setIsBroadcastPanelOpen(prev => !prev);
        setIsProfileOpen(false);
    };

    const handleAvatarClick = () => {
        setIsProfileOpen(prev => !prev);
        setIsBroadcastPanelOpen(false);
    };

    return (
        <header className="flex-shrink-0 bg-white dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700/50 flex items-center justify-between px-4 sm:px-6 lg:px-8 h-20">
            <div className="flex items-center gap-4">
                 <button
                    type="button"
                    onClick={onToggleSidebar}
                    className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors md:hidden"
                    aria-label="Abrir menú"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                    AI Financiero
                </h1>
            </div>
            
            <div className="flex items-center gap-4" ref={dropdownRef}>
                <div className="relative">
                    <button onClick={handleBellClick} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        {unreadMessagesCount > 0 && (
                            <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-white text-[10px] text-center font-bold">{unreadMessagesCount}</span>
                        )}
                    </button>
                    <BroadcastPanel 
                        isOpen={isBroadcastPanelOpen} 
                        onClose={() => setIsBroadcastPanelOpen(false)}
                        messages={broadcasts}
                        onMarkAsRead={onMarkMessageAsRead}
                    />
                </div>
                
                <div className="relative">
                    <button onClick={handleAvatarClick} className="rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-800 focus:ring-blue-500">
                        <div className="h-10 w-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold select-none">
                           {user.username.charAt(0).toUpperCase()}
                        </div>
                    </button>

                    {isProfileOpen && (
                         <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-lg shadow-xl border dark:border-slate-700 z-50 origin-top-right animate-in fade-in-5 slide-in-from-top-2 duration-150">
                            <div className="px-4 py-3 border-b dark:border-slate-700">
                                <div className="flex items-center gap-3">
                                    <p className="font-bold text-slate-800 dark:text-slate-100 truncate">{user.username}</p>
                                     <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${roleColors[user.role]}`}>
                                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{user.role === 'owner' ? 'owner@example.com' : `${user.username.toLowerCase().replace(/\s/g, '')}@example.com`}</p>
                            </div>
                            
                            <div className="px-4 py-3 border-b dark:border-slate-700">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600 dark:text-slate-300">Créditos</span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-100">
                                         {user.role === 'owner' ? 'Ilimitados' : user.credits}
                                    </span>
                                </div>
                                {user.role === 'pro' && <ProDaysDisplay expiresAt={user.proExpiresAt} />}
                            </div>

                            <div className="py-2">
                                {user.role !== 'owner' && (
                                    <button onClick={() => { onRedeemCodeClick(); setIsProfileOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
                                        <span>Canjear Código</span>
                                    </button>
                                )}
                                <button onClick={onLogout} className="w-full text-left flex items-center gap-3 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg>
                                    <span>Cerrar Sesión</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
