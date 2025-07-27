import type { User, RedeemCode, BroadcastMessage } from '../types';

// --- INSTRUCCIONES PARA EL ADMINISTRADOR (Misael y equipo) ---
// Este archivo actúa como la base de datos central inicial de la aplicación.
// Para agregar, editar o eliminar datos de forma permanente, modifica las listas
// a continuación y sube los cambios a GitHub. Vercel reconstruirá la aplicación
// con estos nuevos datos.

// NOTA: Si la aplicación ya ha sido usada en un navegador, los datos viejos pueden
// persistir en el almacenamiento local (localStorage). Para ver los cambios de este
// archivo, puede que necesites borrar el almacenamiento local de tu navegador para este sitio.

// ====================================================================================
// SECCIÓN 1: GESTIÓN DE USUARIOS
// ====================================================================================
// Para crear un nuevo usuario, copia un bloque de usuario existente y pégalo en la lista.
//
// - id: Debe ser único para cada usuario. Formato sugerido: 'user-xxxx'.
// - username: El nombre con el que el usuario iniciará sesión.
// - password: La contraseña.
// - role: 'free' (acceso limitado), 'pro' (acceso completo), 'owner' (acceso total + admin).
// - creditsConfig.initialAmount: Créditos que recibe al registrarse o renovarse.
// - creditsConfig.renewalDays: Cada cuántos días se renuevan los créditos (0 = nunca).
// - proExpiresAt: (Opcional, solo para rol 'pro') Fecha de expiración en formato 'YYYY-MM-DDTHH:MM:SSZ'.
//   Ejemplo: '2025-01-01T00:00:00Z' para que expire en año nuevo de 2025.
// - redeemedCodes: Siempre debe ser un array vacío `[]` para nuevos usuarios.

export const defaultUsers: User[] = [
    {
        id: 'owner-001',
        username: 'Misael',
        password: '12345',
        role: 'owner',
        credits: 999999,
        creditsConfig: { initialAmount: 999999, renewalDays: 0 },
        lastCreditReset: new Date().toISOString(),
        redeemedCodes: [],
    },
    {
        id: 'free-001',
        username: 'prueba',
        password: '12345',
        role: 'free',
        credits: 10,
        creditsConfig: { initialAmount: 10, renewalDays: 1 },
        lastCreditReset: new Date().toISOString(),
        redeemedCodes: [],
    },
];

// ====================================================================================
// SECCIÓN 2: CÓDIGOS DE CANJE
// ====================================================================================
// Para crear un nuevo código, copia un bloque de código y pégalo en la lista.
//
// - id: Debe ser único. Formato sugerido: 'code-xxxx'.
// - code: El texto que el usuario escribirá para canjear (no distingue mayúsculas/minúsculas).
// - rewards.credits: Número de créditos que otorga.
// - rewards.proDays: Número de días de suscripción Pro que otorga.
// - maxUses: Número máximo de veces que este código puede ser usado en total (0 = ilimitado).
// - usersWhoRedeemed: Siempre debe ser un array vacío `[]`.

export const defaultCodes: RedeemCode[] = [
    {
        id: 'default-parciales-01',
        code: 'parciales',
        rewards: { credits: 20, proDays: 0 },
        maxUses: 10,
        usersWhoRedeemed: [],
    },
    {
        id: 'default-finales-01',
        code: 'finales',
        rewards: { credits: 50, proDays: 0 },
        maxUses: 10,
        usersWhoRedeemed: [],
    },
];


// ====================================================================================
// SECCIÓN 3: MENSAJES GLOBALES (NOTIFICACIONES)
// ====================================================================================
// Para enviar un nuevo mensaje a los usuarios (aparece en la campanita).
// Los mensajes se muestran del más nuevo al más viejo.
//
// - id: Debe ser único. Formato sugerido: 'msg-xxxx'.
// - content: El texto del mensaje que verán los usuarios.
// - timestamp: La fecha en que se creó el mensaje (puedes usar `Date.now()`).
// - targetUserId: (Opcional) Si quieres que el mensaje sea solo para un usuario,
//   pon su 'id' aquí. Si lo omites o es `undefined`, es para todos.

export const defaultBroadcasts: BroadcastMessage[] = [
    {
        id: 'msg-welcome-01',
        content: '¡Bienvenido a FinanCalc AI! Los nuevos códigos y usuarios se gestionan centralmente. Contacta al administrador para más detalles.',
        timestamp: Date.now(),
    }
];
