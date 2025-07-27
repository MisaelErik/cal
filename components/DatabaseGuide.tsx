
import React from 'react';

const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <pre className="bg-slate-900 text-slate-200 p-4 rounded-lg overflow-x-auto text-sm">
        <code>{children}</code>
    </pre>
);

const userExample = `
{
    id: 'user-002',
    username: 'nuevo_usuario',
    password: 'password_seguro',
    role: 'pro',
    credits: 100,
    creditsConfig: { initialAmount: 100, renewalDays: 30 },
    lastCreditReset: '2024-05-21T18:30:00.000Z',
    proExpiresAt: '2025-01-01T00:00:00Z',
    redeemedCodes: [],
}
`;

const codeExample = `
{
    id: 'code-bienvenida-24',
    code: 'BIENVENIDA24',
    rewards: { credits: 15, proDays: 7 },
    maxUses: 100,
    usersWhoRedeemed: [],
}
`;

const messageExample = `
{
    id: 'msg-mantenimiento-01',
    content: 'La plataforma estará en mantenimiento el sábado a las 10 PM.',
    timestamp: 1716316200000,
}
`;

const DatabaseGuide: React.FC = () => {
    return (
        <div className="bg-white dark:bg-slate-800/50 dark:border dark:border-slate-700 p-6 sm:p-8 rounded-xl shadow-md space-y-8">
            <div>
                <h2 className="text-2xl font-bold">Guía de la Base de Datos</h2>
                <p className="mt-2 text-slate-600 dark:text-slate-400">
                    Esta guía explica cómo gestionar los datos de la aplicación de forma permanente usando el panel de administración y GitHub.
                </p>
            </div>

            <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 rounded-md">
                 <h3 className="text-xl font-bold text-blue-800 dark:text-blue-200">Nuevo Flujo de Trabajo Simplificado</h3>
                 <p className="text-blue-700 dark:text-blue-300">Ahora, el administrador puede gestionar todos los datos en el "Panel de Administración" y exportarlos a un archivo listo para subir a GitHub.</p>
                 <ol className="list-decimal list-inside space-y-2 mt-2 text-slate-700 dark:text-slate-300">
                    <li>Realiza todos los cambios necesarios en el <strong className="text-slate-800 dark:text-slate-100">Panel de Administración</strong> (crea usuarios, añade códigos, etc.). Los cambios se guardan automáticamente en tu navegador.</li>
                    <li>Cuando estés listo para hacer los cambios permanentes para todos, ve al Panel de Administración y haz clic en el botón <strong className="text-teal-600 dark:text-teal-400">"Exportar a Archivo"</strong>.</li>
                    <li>Se descargará un archivo llamado <code className="font-mono text-sm bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded-md">db.ts</code>.</li>
                    <li>Ve al repositorio del proyecto en GitHub.</li>
                    <li>Navega a la carpeta <code className="font-mono text-sm">src/data/</code>.</li>
                    <li>Usa la opción de "Add file" -&gt; "Upload files" de GitHub para subir el archivo <code className="font-mono text-sm">db.ts</code> que descargaste, reemplazando el existente.</li>
                    <li>Guarda (commit) los cambios en GitHub. Tu plataforma de hosting (Vercel) se actualizará automáticamente.</li>
                 </ol>
            </div>

            <div>
                <h3 className="text-xl font-bold border-b dark:border-slate-600 pb-2">Referencia de Estructuras de Datos</h3>
                <p className="mt-2 text-slate-600 dark:text-slate-400">
                   El archivo exportado <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded-md font-mono text-sm">db.ts</code> contendrá los datos con las siguientes estructuras. No necesitas editarlas manualmente si usas el panel de administración.
                </p>
            </div>

            <div className="space-y-6">
                <h4 className="text-lg font-semibold">Estructura de Usuarios</h4>
                <CodeBlock>{userExample.trim()}</CodeBlock>
            </div>

            <div className="space-y-6">
                 <h4 className="text-lg font-semibold">Estructura de Códigos de Canje</h4>
                <CodeBlock>{codeExample.trim()}</CodeBlock>
            </div>

             <div className="space-y-6">
                <h4 className="text-lg font-semibold">Estructura de Mensajes Globales</h4>
                <CodeBlock>{messageExample.trim()}</CodeBlock>
            </div>
        </div>
    );
};

export default DatabaseGuide;
