
import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage, Provider } from '../types';

interface FollowUpChatProps {
    history: ChatMessage[];
    isLoading: boolean;
    onSendMessage: (message: string) => void;
    chatProvider: Exclude<Provider, 'all'>;
    onChatProviderChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    providerNames: Record<Provider, string>;
    availableProviders: Exclude<Provider, 'all'>[];
}

const FollowUpChat: React.FC<FollowUpChatProps> = ({ history, isLoading, onSendMessage, chatProvider, onChatProviderChange, providerNames, availableProviders }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [history, isLoading]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            onSendMessage(input.trim());
            setInput('');
        }
    };
    
    return (
        <div className="bg-white dark:bg-slate-800/50 dark:border dark:border-slate-700 p-4 sm:p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Análisis de Resultados con IA</h3>
            <div className="h-80 bg-slate-50 dark:bg-slate-800 rounded-lg p-4 flex flex-col gap-4 overflow-y-auto border dark:border-slate-600/50">
                {history.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-prose p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'}`}>
                           <div className="prose prose-sm dark:prose-invert" style={{ whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br />') }}></div>
                        </div>
                    </div>
                ))}
                 {isLoading && (
                    <div className="flex justify-start">
                        <div className="max-w-prose p-3 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                           <div className="flex items-center gap-2">
                               <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                               <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                               <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                           </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSubmit} className="mt-4">
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Pregunta por qué los resultados son diferentes, cuál es correcto..."
                        disabled={isLoading}
                        className="flex-grow p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="bg-blue-600 text-white font-bold py-3 px-5 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                        aria-label="Enviar pregunta"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.428A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                    </button>
                </div>
                 <div className="mt-3 flex items-center gap-2">
                    <label htmlFor="chat-provider-select" className="text-sm font-medium text-slate-500 dark:text-slate-400">Analizando con:</label>
                    <select
                        id="chat-provider-select"
                        value={chatProvider}
                        onChange={onChatProviderChange}
                        disabled={isLoading}
                        className="p-1 text-sm border border-slate-300 dark:border-slate-600 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200 disabled:bg-slate-100 dark:disabled:bg-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    >
                        {availableProviders.map(p => (
                            <option key={p} value={p}>{providerNames[p]}</option>
                        ))}
                    </select>
                </div>
            </form>
        </div>
    );
};

export default FollowUpChat;
