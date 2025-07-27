import React, { useState } from 'react';

interface LoginProps {
  onLogin: (username: string, password: string) => boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onLogin(username, password);
    if (!success) {
        setError('Usuario o contraseña incorrectos.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 px-4">
        <div className="w-full max-w-md">
            <div className="text-center mb-8">
                 <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-slate-100">
                    FinanCalc <span className="text-blue-600 dark:text-blue-400">AI</span>
                </h1>
                <p className="mt-3 text-lg text-slate-600 dark:text-slate-400">
                    Por favor, inicie sesión para continuar.
                </p>
            </div>
            <div className="bg-white dark:bg-slate-800/50 dark:border dark:border-slate-700 shadow-xl rounded-2xl p-8">
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label 
                            htmlFor="username" 
                            className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                        >
                            Usuario
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-slate-800 dark:text-slate-200"
                        />
                    </div>
                    <div>
                         <label 
                            htmlFor="password" 
                            className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                        >
                            Contraseña
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-slate-800 dark:text-slate-200"
                        />
                    </div>

                    {error && (
                        <div className="text-red-500 dark:text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-800"
                        >
                            Entrar
                        </button>
                    </div>
                </form>
                <div className="text-center mt-4 text-xs text-slate-500 dark:text-slate-400">
                    <p>Usuarios de prueba:</p>
                    <p>Owner: Misael / 12345</p>
                    <p>Gratis: prueba / 12345</p>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Login;