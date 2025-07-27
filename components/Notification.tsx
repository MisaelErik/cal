
import React, { useEffect, useState } from 'react';
import type { Notification as NotificationType } from '../types';

interface NotificationProps {
    notification: NotificationType | null;
}

const ICONS = {
    success: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    error: (
         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    info: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
             <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    )
};

const BG_COLORS = {
    success: 'bg-green-100 dark:bg-green-900/30 border-green-400 dark:border-green-600',
    error: 'bg-red-100 dark:bg-red-900/30 border-red-400 dark:border-red-600',
    info: 'bg-blue-100 dark:bg-blue-900/30 border-blue-400 dark:border-blue-600',
};

const TEXT_COLORS = {
    success: 'text-green-800 dark:text-green-200',
    error: 'text-red-800 dark:text-red-200',
    info: 'text-blue-800 dark:text-blue-200',
}

const Notification: React.FC<NotificationProps> = ({ notification }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (notification) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [notification]);

    if (!notification) return null;

    return (
        <div
            className={`fixed top-8 right-8 z-[100] transition-all duration-300 ease-in-out ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}
        >
            <div className={`flex items-center gap-4 p-4 rounded-lg shadow-lg border-l-4 ${BG_COLORS[notification.type]}`}>
                <div>{ICONS[notification.type]}</div>
                <p className={`font-semibold ${TEXT_COLORS[notification.type]}`}>
                    {notification.message}
                </p>
            </div>
        </div>
    );
};

export default Notification;
