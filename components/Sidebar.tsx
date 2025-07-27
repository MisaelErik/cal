
import React from 'react';
import type { User, View } from '../types';

// Icons as React Components
const AiIcon = ({ className = "h-7 w-7" }: { className?: string }) => (
    <svg fill="currentColor" viewBox="0 0 16 16" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M8 1a2.5 2.5 0 0 1 2.5 2.5V4h-5v-.5A2.5 2.5 0 0 1 8 1zm3.5 3v-.5a3.5 3.5 0 1 0-7 0V4H4.5A1.5 1.5 0 0 0 3 5.5V9h10V5.5A1.5 1.5 0 0 0 11.5 4h-1zM4 10v2.5A1.5 1.5 0 0 0 5.5 14h5a1.5 1.5 0 0 0 1.5-1.5V10H4z"/>
    </svg>
);
const CalculatorIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m-6 4h6m-6 4h6m2 2H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2z" />
  </svg>
);
const HistoryIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const AdminIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286zm0 13.036h.008v.008h-.008v-.008z" />
  </svg>
);
const DatabaseIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const NavItem: React.FC<{
    label: string;
    viewName: View;
    currentView: View;
    setView: (view: View) => void;
    children: React.ReactNode;
    isExpanded: boolean;
}> = ({ label, viewName, currentView, setView, children, isExpanded }) => (
    <button
        onClick={() => setView(viewName)}
        title={label}
        className={`w-full flex items-center p-3 my-1 rounded-lg transition-colors duration-200 ${
            currentView === viewName
                ? 'bg-violet-600 text-white'
                : 'text-slate-400 hover:bg-slate-700 hover:text-white'
        } ${isExpanded ? 'justify-start' : 'justify-center'}`}
    >
        {children}
    </button>
);

const navItems = [
    { view: 'solver' as View, label: 'AI Solver', icon: AiIcon },
    { view: 'manual' as View, label: 'Manual Calculator', icon: CalculatorIcon },
    { view: 'history' as View, label: 'History', icon: HistoryIcon, pro: true },
    { view: 'admin' as View, label: 'Admin Panel', icon: AdminIcon, owner: true },
    { view: 'database' as View, label: 'Database Guide', icon: DatabaseIcon, owner: true },
];

interface SidebarProps {
    user: User | null;
    currentView: View;
    setView: (view: View) => void;
    isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ user, currentView, setView, isOpen }) => {
    if (!user) return null;

    return (
        <aside className={`fixed inset-y-0 left-0 z-30 bg-slate-900 flex flex-col py-4 shrink-0
                         transition-all duration-300 ease-in-out md:relative md:translate-x-0
                         ${isOpen ? 'w-64 px-4' : 'w-[88px] px-3'}
                         ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
            <div className={`flex items-center mb-6 h-12 ${isOpen ? 'justify-start' : 'justify-center'}`}>
                 <div className="p-2 bg-violet-600 rounded-lg flex-shrink-0">
                     <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" />
                        <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h8a2 2 0 002-2v-1a2 2 0 012-2h1.945" />
                        <path d="M12 18v-2m-3-4a3 3 0 00-3 3v3h12v-3a3 3 0 00-3-3h-6z" />
                    </svg>
                 </div>
                 {isOpen && <span className="ml-3 text-2xl font-bold text-white whitespace-nowrap">FinanCalc</span>}
            </div>
            
            <nav className="flex-1 flex flex-col items-center space-y-2 w-full">
                {navItems.map(item => {
                    const { view, label, icon: Icon, pro, owner } = item;
                    if (pro && user.role !== 'pro' && user.role !== 'owner') return null;
                    if (owner && user.role !== 'owner') return null;

                    return (
                        <NavItem key={view} label={label} viewName={view} currentView={currentView} setView={setView} isExpanded={isOpen}>
                           <Icon className={`flex-shrink-0 ${view === 'solver' ? 'h-7 w-7' : 'h-6 w-6'}`} />
                           <span className={`ml-4 text-base font-medium whitespace-nowrap ${!isOpen && 'hidden'}`}>{label}</span>
                        </NavItem>
                    )
                })}
            </nav>
        </aside>
    );
};

export default Sidebar;
