const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('session');
    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        auth: state,
        printQRInTerminal: true,
        browser: ['MY-BOT', 'Chrome', '1.0']
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Connection closed, reconnecting...', shouldReconnect);
            if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            console.log('✅ BOT CONNECTED! MY-BOT ONLINE!');
        }
    });

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;
        const from = msg.key.remoteJid;
        const body = msg.message.conversation || msg.message.extendedTextMessage?.text || "";

        if (body === '.menu' || body === '.hi' || body === 'hi') {
            await sock.sendMessage(from, { text: `👑 *MY-BOT MENU* 👑\n\n╭───────────\n│ .menu - මෙනු එක\n│ .hi - හලෝ කියන්න\n│ .ping - බොට් වැඩද බලන්න\n│ .owner - අයිතිකාරයා\n╰───────────\n\n_Powered by MY-BOT_ ✨` });
        }
        if (body === '.ping') {
            await sock.sendMessage(from, { text: '🏓 Pong! Bot වැඩ බන්! 🔥' });
        }
        if (body === '.owner') {
            await sock.sendMessage(from, { text: '👑 මගේ Owner: malibuchamoth-design' });
        }
    });
}
startBot();
