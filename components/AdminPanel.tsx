
import React, { useState } from 'react';
import type { User, RedeemCode, BroadcastMessage } from '../types';
import UserFormModal from './UserFormModal';
import CodesPanel from './CodesPanel';
import MessagesPanel from './MessagesPanel';
import { generateDbFileContent } from '../services/dbExporter';


interface AdminPanelProps {
    users: User[];
    onAddUser: (userData: Omit<User, 'id' | 'credits' | 'lastCreditReset' | 'redeemedCodes'> & { proDurationDays?: number }) => void;
    onUpdateUser: (userId: string, updatedData: Partial<User> & { proDurationDays?: number }) => void;
    onDeleteUser: (userId: string) => void;

    codes: RedeemCode[];
    onAddCode: (codeData: Omit<RedeemCode, 'id' | 'usersWhoRedeemed'>) => void;
    onDeleteCode: (codeId: string) => void;

    broadcasts: BroadcastMessage[];
    onAddBroadcast: (messageData: Omit<BroadcastMessage, 'id' | 'timestamp'>) => void;
}

type Tab = 'users' | 'codes' | 'messages';


// --- Main Admin Panel ---
const AdminPanel: React.FC<AdminPanelProps> = ({ users, onAddUser, onUpdateUser, onDeleteUser, codes, onAddCode, onDeleteCode, broadcasts, onAddBroadcast }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>('users');

    const handleOpenModalForCreate = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const handleOpenModalForEdit = (user: User) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
    };

    const handleSaveUser = (userData: any) => {
        try {
            if (editingUser) {
                onUpdateUser(editingUser.id, userData);
            } else {
                onAddUser(userData);
            }
            handleCloseModal();
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Ocurrió un error');
        }
    };
    
    const handleExportDatabase = () => {
        try {
            const fileContent = generateDbFileContent(users, codes, broadcasts);
            const blob = new Blob([fileContent], { type: 'application/typescript;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'db.ts';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error exporting database:", error);
            alert("Ocurrió un error al exportar la base de datos.");
        }
    };

    const roleColors: Record<User['role'], string> = {
        owner: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
        pro: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
        free: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    };

    return (
        <div className="bg-white dark:bg-slate-800/50 dark:border dark:border-slate-700 p-6 sm:p-8 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-6 border-b dark:border-slate-600 pb-4">
                <h2 className="text-2xl font-bold">Panel de Administración</h2>
                 <div className="flex items-center gap-x-3">
                    <button 
                        onClick={handleExportDatabase} 
                        title="Exporta el estado actual de usuarios, códigos y mensajes a un archivo db.ts que puedes usar para actualizar el repositorio de GitHub." 
                        className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors"
                    >
                        Exportar a Archivo
                    </button>
                    {activeTab === 'users' && (
                        <button onClick={handleOpenModalForCreate} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                            + Crear Usuario
                        </button>
                    )}
                </div>
            </div>
            
            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                <nav className="-mb-px flex space-x-6">
                    <button onClick={() => setActiveTab('users')} className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'users' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Usuarios</button>
                    <button onClick={() => setActiveTab('codes')} className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'codes' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Códigos de Canje</button>
                    <button onClick={() => setActiveTab('messages')} className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'messages' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Mensajes</button>
                </nav>
            </div>
            
            {activeTab === 'users' && (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                            <tr>
                                <th scope="col" className="px-6 py-3">Usuario</th>
                                <th scope="col" className="px-6 py-3">Rol</th>
                                <th scope="col" className="px-6 py-3">Créditos</th>
                                <th scope="col" className="px-6 py-3">Renovación</th>
                                <th scope="col" className="px-6 py-3">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/50">
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{user.username}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${roleColors[user.role]}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{user.role === 'owner' ? '∞' : user.credits}</td>
                                    <td className="px-6 py-4">{user.creditsConfig.renewalDays > 0 ? `Cada ${user.creditsConfig.renewalDays} día(s)` : 'Nunca'}</td>
                                    <td className="px-6 py-4 flex gap-2">
                                        <button onClick={() => handleOpenModalForEdit(user)} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Editar</button>
                                        {user.role !== 'owner' && (
                                            <button onClick={() => window.confirm('¿Seguro que quieres eliminar a este usuario?') && onDeleteUser(user.id)} className="font-medium text-red-600 dark:text-red-500 hover:underline">Eliminar</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
            {activeTab === 'codes' && <CodesPanel codes={codes} onAddCode={onAddCode} onDeleteCode={onDeleteCode} />}
            {activeTab === 'messages' && <MessagesPanel users={users} onAddBroadcast={onAddBroadcast} />}
            
            {isModalOpen && (
                <UserFormModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSaveUser}
                    user={editingUser}
                />
            )}
        </div>
    );
};

export default AdminPanel;
