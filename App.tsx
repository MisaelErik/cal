
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import type { AppResult, Provider, Mode, User, HistoryItem, View, Notification as NotificationType, RedeemCode, BroadcastMessage, ChatMessage } from './types';
import { generateCalculationPlan, extractTextFromImage, generateChatResponse } from './services/geminiService';
import { executePlan } from './services/calculationEngine';
import ProblemInput from './components/ProblemInput';
import ResultsDisplay from './components/ResultsDisplay';
import Header from './components/Header';
import { ErrorAlert } from './components/Alerts';
import { Controls } from './components/Controls';
import Login from './components/Login';
import ProModal from './components/ProModal';
import AdminPanel from './components/AdminPanel';
import HistoryPanel from './components/HistoryPanel';
import ManualCalculator from './components/ManualCalculator';
import Notification from './components/Notification';
import RedeemCodeModal from './components/RedeemCodeModal';
import DatabaseGuide from './components/DatabaseGuide';
import FollowUpChat from './components/FollowUpChat';
import Sidebar from './components/Sidebar';
import { useUsers } from './hooks/useUsers';
import { useHistory } from './hooks/useHistory';
import { useCodes } from './hooks/useCodes';
import { useBroadcasts } from './hooks/useBroadcasts';
import { useUserMessages } from './hooks/useUserMessages';

const PROVIDER_NAMES: Record<Provider, string> = {
    gemini_studio: 'Google AI Studio',
    openrouter_kimi: 'OpenRouter (Kimi)',
    openrouter_mistral: 'OpenRouter (Mistral)',
    openrouter_geo: 'Geo (vía OpenRouter)',
    openrouter_deepseek: 'OpenRouter (Deepseek)',
    all: 'Todas las IAs',
};

const CHAT_PROVIDERS: Exclude<Provider, 'all'>[] = [
    'gemini_studio', 'openrouter_kimi', 'openrouter_mistral', 'openrouter_geo', 'openrouter_deepseek'
];


const VIEW_TITLES: Record<View, string> = {
    solver: 'AI Financial Problem Solver',
    manual: 'Manual Calculator',
    history: 'History',
    admin: 'Admin Panel',
    database: 'Database Guide'
};

const App: React.FC = () => {
    const [problemDescription, setProblemDescription] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isOcrLoading, setIsOcrLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<AppResult[] | null>(null);
    const [provider, setProvider] = useState<Provider>('gemini_studio');
    const [mode, setMode] = useState<Mode>('preciso');
    const [showProModal, setShowProModal] = useState<boolean>(false);
    const [showRedeemCodeModal, setShowRedeemCodeModal] = useState<boolean>(false);
    const [copiedProvider, setCopiedProvider] = useState<string | null>(null);
    const [notification, setNotification] = useState<NotificationType | null>(null);
    
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
    const [showChat, setShowChat] = useState<boolean>(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
    const [chatProvider, setChatProvider] = useState<Exclude<Provider, 'all'>>('gemini_studio');
    const [abortController, setAbortController] = useState<AbortController | null>(null);

    const { users, currentUser, setCurrentUser, login, logout, addUser, updateUser, deleteUser, consumeCredit, checkAndResetUser, applyCodeRewards } = useUsers();
    const { history, addHistoryItem, clearHistory } = useHistory(currentUser);
    const { codes, addCode, deleteCode, redeemCode } = useCodes();
    const { broadcasts, addBroadcast } = useBroadcasts();
    
    const { readMessages, markAsRead, unreadCount, userBroadcasts } = useUserMessages(broadcasts, currentUser);

    const [view, setView] = useState<View>('solver');
    
    const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info', duration: number = 3000) => {
        setNotification({ message, type });
        setTimeout(() => {
            setNotification(null);
        }, duration);
    }, []);

    // Check and reset credits/pro status on login
    useEffect(() => {
        if (currentUser) {
            checkAndResetUser(currentUser.id);
        }
    }, [currentUser?.id]);

    const handleLogin = (username: string, password: string): boolean => {
        const success = login(username, password);
        if (success) {
            setView('solver'); // Reset to solver view on login
            setResults(null);
            setError(null);
            setProblemDescription('');
            setChatHistory([]);
            setShowChat(false);
        }
        return success;
    };
    
    const handleLogout = () => {
        logout();
        setView('solver');
    };

    const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newProvider = e.target.value as Provider;
        if (currentUser?.role === 'free' && newProvider === 'all') {
            setShowProModal(true);
            return;
        }
        setProvider(newProvider);
    };
    
    const handleModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newMode = e.target.value as Mode;
        if (currentUser?.role === 'free' && newMode === 'experimental') {
            setShowProModal(true);
            return;
        }
        setMode(newMode);
    };

    const handleImageUpload = async (file: File) => {
        if (!file) return;
        setIsOcrLoading(true);
        setError(null);
        try {
            const text = await extractTextFromImage(file);
            setProblemDescription(prev => prev ? `${prev}\n\n${text}`.trim() : text);
        } catch (e) {
            const message = e instanceof Error ? e.message : "No se pudo procesar la imagen.";
            setError(`Error de OCR: ${message}`);
        } finally {
            setIsOcrLoading(false);
        }
    };
    
    const handleHistorySelect = (item: HistoryItem) => {
        setProblemDescription(item.problemDescription);
        setResults(item.results);
        setChatHistory([]);
        setShowChat(false);
        handleSetView('solver');
    };

    const handleRedeemCode = (codeString: string) => {
        if (!currentUser) return;
        try {
            const code = redeemCode(codeString, currentUser.id);
            applyCodeRewards(currentUser.id, code);
            setShowRedeemCodeModal(false);
            showNotification('¡Código canjeado con éxito!', 'success');
        } catch (error) {
            showNotification(error instanceof Error ? error.message : 'Error al canjear el código', 'error');
        }
    };
    
    const handleSendMessage = useCallback(async (message: string) => {
        if (!message.trim() || !results || results.length === 0) return;

        const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', content: message }];
        setChatHistory(newHistory);
        setIsChatLoading(true);
    
        try {
            const aiResponse = await generateChatResponse(
                chatProvider,
                problemDescription,
                results,
                newHistory, // Pass the new history so AI sees the latest question
                message
            );
            setChatHistory(prev => [...prev, { role: 'ai', content: aiResponse }]);
        } catch (e) {
            const errorMsg = e instanceof Error ? e.message : "Error al comunicarse con la IA.";
            setChatHistory(prev => [...prev, { role: 'ai', content: `Lo siento, ocurrió un error: ${errorMsg}` }]);
        } finally {
            setIsChatLoading(false);
        }
    
    }, [chatHistory, results, problemDescription, chatProvider]);


    const handleStop = useCallback(() => {
        if (abortController) {
            abortController.abort();
            setIsLoading(false);
            setAbortController(null);
            showNotification('Cálculo cancelado por el usuario.', 'info');
        }
    }, [abortController, showNotification]);

    const handleCalculate = useCallback(async () => {
        if (!problemDescription.trim() || !currentUser) {
            setError("Por favor, describe el problema financiero.");
            return;
        }
        
        if (currentUser.role === 'free' && currentUser.credits <= 0) {
            setError("No tienes suficientes créditos. Tus créditos se renuevan periódicamente.");
            return;
        }
        
        const controller = new AbortController();
        setAbortController(controller);

        setIsLoading(true);
        setError(null);
        setResults(null);
        setCopiedProvider(null);
        setChatHistory([]);
        setShowChat(false);

        try {
            const providersToRun: Exclude<Provider, 'all'>[] = provider === 'all'
                ? ['gemini_studio', 'openrouter_kimi', 'openrouter_mistral', 'openrouter_geo', 'openrouter_deepseek']
                : [provider as Exclude<Provider, 'all'>];
            
            let allResults: (AppResult | null)[] = [];
            let successfulCalls = 0;

            const processProvider = async (p: Exclude<Provider, 'all'>): Promise<AppResult | null> => {
                try {
                    const plan = await generateCalculationPlan(p, mode, problemDescription, controller.signal);
                    if (controller.signal.aborted) return null;
                    const executedSteps = executePlan(plan);
                    if (executedSteps && executedSteps.length > 0) {
                       successfulCalls++;
                    }
                    return { provider: p, plan, executedSteps, error: null, rawError: null };
                } catch (e: unknown) {
                    if (e instanceof Error && e.name === 'AbortError') {
                        return null; // Gracefully handle abortion
                    }
                    console.error(`Error with provider ${p}:`, e);
                    const message = e instanceof Error ? e.message : "Ocurrió un error desconocido.";
                    return { provider: p, plan: null, executedSteps: null, error: message, rawError: e };
                }
            };

            if (provider === 'all') {
                setResults([]); // Init for progressive rendering
                const promises = providersToRun.map(p => 
                    processProvider(p).then(res => {
                        if (controller.signal.aborted) return null;
                        if (res) {
                            setResults(prev => [...(prev || []), res].sort((a, b) => providersToRun.indexOf(a.provider as any) - providersToRun.indexOf(b.provider as any)));
                        }
                        return res;
                    })
                );
                allResults = await Promise.all(promises);
            } else {
                const result = await processProvider(providersToRun[0]);
                allResults = [result];
                if (!controller.signal.aborted) {
                    setResults(allResults.filter(Boolean) as AppResult[]);
                }
            }

            if (controller.signal.aborted) {
                console.log("Calculation process was stopped by the user.");
                return;
            }
            
            const finalResults = allResults.filter(Boolean) as AppResult[];

            if (successfulCalls > 0 && currentUser.role !== 'free' && finalResults.length > 0) {
                addHistoryItem({
                    problemDescription,
                    results: finalResults,
                });
            }
            
            if (successfulCalls > 0) {
                consumeCredit(currentUser.id);
            }
        } catch(e) {
             if (e instanceof Error && e.name !== 'AbortError') {
                 setError(`An unexpected error occurred: ${e.message}`);
             }
        } finally {
            if (!controller.signal.aborted) {
                setIsLoading(false);
                setAbortController(null);
            }
        }

    }, [problemDescription, provider, mode, currentUser, consumeCredit, addHistoryItem]);
    
    const credits = useMemo(() => currentUser?.credits, [currentUser]);

    const handleSetView = (view: View) => {
        setView(view);
        setIsSidebarOpen(false);
    };

    const handleToggleChat = () => {
        if (currentUser?.role === 'free') {
            setShowProModal(true);
        } else {
            setShowChat(prev => !prev);
        }
    };

    if (!currentUser) {
        return <Login onLogin={handleLogin} />;
    }
    
    const renderView = () => {
        switch (view) {
            case 'history':
                return <HistoryPanel history={history} onSelect={handleHistorySelect} onClear={clearHistory} />;
            case 'admin':
                return currentUser.role === 'owner' ? <AdminPanel users={users} onAddUser={addUser} onUpdateUser={updateUser} onDeleteUser={deleteUser} codes={codes} onAddCode={addCode} onDeleteCode={deleteCode} broadcasts={broadcasts} onAddBroadcast={addBroadcast} /> : <p>Acceso denegado</p>;
            case 'manual':
                return <ManualCalculator onShowNotification={showNotification} />;
            case 'database':
                 return currentUser.role === 'owner' ? <DatabaseGuide /> : <p>Acceso denegado</p>;
            case 'solver':
            default:
                return (
                    <>
                       <div className="bg-white dark:bg-slate-800/50 dark:border dark:border-slate-700 p-6 sm:p-8 rounded-xl shadow-md">
                             <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-6">
                                {VIEW_TITLES[view]}
                            </h1>
                            <Controls 
                                provider={provider}
                                onProviderChange={handleProviderChange}
                                mode={mode}
                                onModeChange={handleModeChange}
                                isLoading={isLoading || isOcrLoading}
                                userRole={currentUser.role}
                            />
                            <ProblemInput
                                value={problemDescription}
                                onChange={(e) => setProblemDescription(e.target.value)}
                                onCalculate={handleCalculate}
                                onImageUpload={handleImageUpload}
                                isLoading={isLoading}
                                isOcrLoading={isOcrLoading}
                                credits={credits ?? 0}
                                userRole={currentUser.role}
                                onStop={handleStop}
                            />
                        </div>
                        
                        {error && <div className="mt-6"><ErrorAlert message={error} /></div>}
                        
                        {isLoading && !results?.length && (
                           <div className="flex justify-center items-center mt-8 p-8 bg-white dark:bg-slate-800/50 dark:border dark:border-slate-700 rounded-xl shadow-md">
                                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                <p className="ml-4 text-lg font-semibold text-slate-600 dark:text-slate-300">Analizando y calculando...</p>
                            </div>
                        )}

                        {(results && results.length > 0) && (
                            <div className="mt-8 space-y-8">
                                <div className={`${provider === 'all' ? 'grid grid-cols-1 lg:grid-cols-1 xl:grid-cols-1 gap-8' : ''}`}>
                                    {results.map(res => (
                                        <div key={res.provider} className={provider === 'all' ? 'bg-white dark:bg-slate-800/50 dark:border dark:border-slate-700 rounded-xl shadow-md' : ''}>
                                            {provider === 'all' && (
                                                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4 border-b-2 border-blue-500 dark:border-blue-400 pb-2 p-6">
                                                   Resultados de: <span className="text-blue-600 dark:text-blue-400">{PROVIDER_NAMES[res.provider as keyof typeof PROVIDER_NAMES]}</span>
                                                </h2>
                                            )}
                                            <div className={provider === 'all' ? 'p-6 pt-0' : ''}>
                                                {res.error ? (
                                                    <div className="space-y-3">
                                                        <ErrorAlert message={res.error} />
                                                        {currentUser.role === 'owner' && res.rawError && (
                                                            <button
                                                                onClick={() => {
                                                                    const errorString = JSON.stringify(res.rawError, Object.getOwnPropertyNames(res.rawError), 2);
                                                                    navigator.clipboard.writeText(errorString);
                                                                    setCopiedProvider(res.provider);
                                                                    showNotification('Error crudo copiado al portapapeles.', 'success');
                                                                    setTimeout(() => setCopiedProvider(null), 2000);
                                                                }}
                                                                className="w-full sm:w-auto text-sm bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                                                            >
                                                                {copiedProvider === res.provider ? '¡Error Copiado!' : 'Copiar Error Crudo'}
                                                            </button>
                                                        )}
                                                    </div>
                                                ) : res.plan && res.executedSteps && (
                                                    <ResultsDisplay 
                                                        problemDescription={problemDescription}
                                                        plan={res.plan} 
                                                        executedSteps={res.executedSteps} 
                                                        userRole={currentUser.role}
                                                        onShowNotification={showNotification}
                                                        onUpgradeToPro={() => setShowProModal(true)}
                                                        />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                {results.some(r => r.executedSteps) && (
                                    <div className="flex justify-center mt-6">
                                        <button
                                            onClick={handleToggleChat}
                                            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-slate-400 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M7 8a3 3 0 100-6 3 3 0 000 6zM14.5 9a4.5 4.5 0 100-9 4.5 4.5 0 000 9zM1.146 11.854a.5.5 0 01.708 0L4 14.293V16.5a.5.5 0 01-1 0v-1.914l-2.146-2.147a.5.5 0 010-.708zM16 14.293l2.146-2.147a.5.5 0 01.708.708L16.707 15H17.5a.5.5 0 010 1h-1.293l2.147 2.146a.5.5 0 01-.708.708L16 16.707V17.5a.5.5 0 01-1 0v-1.293l-2.146-2.147a.5.5 0 01.708-.708L15 14.293V13.5a.5.5 0 011 0v.793zM5 16.5a.5.5 0 01.5-.5h4a.5.5 0 010 1h-4a.5.5 0 01-.5-.5z"/>
                                            </svg>
                                            {showChat ? "Ocultar Análisis IA" : "Analizar Resultados con IA"}
                                            {currentUser.role === 'free' && (
                                                <span className="ml-2 text-xs font-bold text-indigo-700 bg-indigo-100 dark:bg-indigo-900 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                                                    PRO
                                                </span>
                                            )}
                                        </button>
                                    </div>
                                )}

                                {showChat && (
                                    <FollowUpChat
                                        history={chatHistory}
                                        isLoading={isChatLoading}
                                        onSendMessage={handleSendMessage}
                                        chatProvider={chatProvider}
                                        onChatProviderChange={(e) => setChatProvider(e.target.value as Exclude<Provider, 'all'>)}
                                        providerNames={PROVIDER_NAMES}
                                        availableProviders={CHAT_PROVIDERS}
                                    />
                                )}
                            </div>
                        )}
                    </>
                );
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                    aria-hidden="true"
                ></div>
            )}
            <Sidebar user={currentUser} currentView={view} setView={handleSetView} isOpen={isSidebarOpen} />
            
            <div className="flex-1 flex flex-col">
                 <Header 
                    user={currentUser} 
                    onLogout={handleLogout}
                    onRedeemCodeClick={() => setShowRedeemCodeModal(true)}
                    unreadMessagesCount={unreadCount}
                    broadcasts={userBroadcasts}
                    onMarkMessageAsRead={markAsRead}
                    onToggleSidebar={() => setIsSidebarOpen(true)}
                />
                <main className="flex-grow overflow-y-auto">
                    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
                        {renderView()}
                    </div>
                </main>
            </div>

            <Notification notification={notification} />
            <ProModal isOpen={showProModal} onClose={() => setShowProModal(false)} />
            <RedeemCodeModal 
                isOpen={showRedeemCodeModal} 
                onClose={() => setShowRedeemCodeModal(false)} 
                onRedeem={handleRedeemCode}
            />
        </div>
    );
};

export default App;
