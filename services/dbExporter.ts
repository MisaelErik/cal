
import type { User, RedeemCode, BroadcastMessage } from '../types';

const fileTemplate = (usersString: string, codesString: string, broadcastsString: string) => `import type { User, RedeemCode, BroadcastMessage } from '../types';

// --- INSTRUCCIONES PARA EL ADMINISTRADOR ---
// Este archivo fue generado automáticamente por la aplicación FinanCalc AI.
// Para persistir los cambios de forma permanente para todos los usuarios, sigue estos pasos:
// 1. Ve al repositorio de GitHub del proyecto.
// 2. Navega a la carpeta 'src/data/'.
// 3. Reemplaza el contenido del archivo 'db.ts' existente con el contenido de este archivo.
// 4. Guarda (commit) los cambios.
// 5. La plataforma de hosting (Vercel) se redesplegará automáticamente con la nueva base de datos.
//
// NOTA: Los cambios manuales a este archivo pueden ser sobreescritos por futuras exportaciones.

// ====================================================================================
// SECCIÓN 1: GESTIÓN DE USUARIOS (Exportado: ${new Date().toLocaleString()})
// ====================================================================================
export const defaultUsers: User[] = ${usersString};

// ====================================================================================
// SECCIÓN 2: CÓDIGOS DE CANJE
// ====================================================================================
export const defaultCodes: RedeemCode[] = ${codesString};


// ====================================================================================
// SECCIÓN 3: MENSAJES GLOBALES (NOTIFICACIONES)
// ====================================================================================
export const defaultBroadcasts: BroadcastMessage[] = ${broadcastsString};
`;

export function generateDbFileContent(users: User[], codes: RedeemCode[], broadcasts: BroadcastMessage[]): string {
    const replacer = (key: string, value: any) => value === undefined ? null : value;

    const usersJson = JSON.stringify(users, replacer, 4);
    const codesJson = JSON.stringify(codes, replacer, 4);
    const broadcastsJson = JSON.stringify(broadcasts, replacer, 4);

    return fileTemplate(usersJson, codesJson, broadcastsJson);
}
