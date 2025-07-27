
import React, { useState, useEffect } from 'react';
import type { User, UserRole } from '../types';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: Partial<User> & { proDurationDays?: number }) => void;
  user: User | null;
}

const UserFormModal: React.FC<UserFormModalProps> = ({ isOpen, onClose, onSave, user }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'free' as UserRole,
    initialAmount: 10,
    renewalDays: 1,
    proDurationDays: 30,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        password: '', // Don't pre-fill password for security
        role: user.role,
        initialAmount: user.creditsConfig.initialAmount,
        renewalDays: user.creditsConfig.renewalDays,
        proDurationDays: 30, // Default duration when editing
      });
    } else {
      setFormData({
        username: '',
        password: '',
        role: 'free',
        initialAmount: 10,
        renewalDays: 1,
        proDurationDays: 30,
      });
    }
  }, [user, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isNumber = type === 'number';
    setFormData(prev => ({ ...prev, [name]: isNumber ? parseInt(value, 10) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSave: any = {
      username: formData.username,
      role: formData.role,
      creditsConfig: {
          initialAmount: formData.initialAmount,
          renewalDays: formData.renewalDays,
      },
      proDurationDays: formData.role === 'pro' ? formData.proDurationDays : undefined,
    };
    if (formData.password) {
      dataToSave.password = formData.password;
    }
    if (!user && !formData.password) {
        alert("La contraseña es obligatoria para nuevos usuarios.");
        return;
    }
    onSave(dataToSave);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-8 max-w-lg w-full transform transition-all" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{user ? 'Editar Usuario' : 'Crear Usuario'}</h2>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Usuario</label>
            <input type="text" name="username" value={formData.username} onChange={handleChange} required disabled={!!user} className="mt-1 w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 disabled:bg-slate-200 dark:disabled:bg-slate-700/50" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Contraseña</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder={user ? 'Dejar en blanco para no cambiar' : 'Requerido'} className="mt-1 w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Rol</label>
                 <select name="role" value={formData.role} onChange={handleChange} disabled={user?.role === 'owner'} className="mt-1 w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 disabled:bg-slate-200 dark:disabled:bg-slate-700/50">
                    <option value="free">Gratis</option>
                    <option value="pro">Pro</option>
                 </select>
              </div>
              {formData.role === 'pro' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Duración Pro (días)</label>
                  <input type="number" name="proDurationDays" value={formData.proDurationDays} onChange={handleChange} min="1" className="mt-1 w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" />
                </div>
              )}
          </div>

          <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Créditos Iniciales</label>
                <input type="number" name="initialAmount" value={formData.initialAmount} onChange={handleChange} min="0" className="mt-1 w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Renovar cada (días)</label>
                <input type="number" name="renewalDays" value={formData.renewalDays} onChange={handleChange} min="0" placeholder="0 para no renovar" className="mt-1 w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" />
              </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 rounded-lg">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;
