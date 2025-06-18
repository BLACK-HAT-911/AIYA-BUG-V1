/**
 * AIYA BUG V1 - Main Bot Entry
 * Owner: BLACK-HAT-911
 * Repo: https://github.com/BLACK-HAT-911/AIYA-BUG-V1
 */

import fs from 'fs';
import path from 'path';
import express from 'express';
import pino from 'pino';
import dotenv from 'dotenv';
import qrcode from 'qrcode-terminal';
import baileys from 'baileys';
import { fileURLToPath } from 'url';
import { BANNER_IMAGE, BOT_SOUND } from './lib/media.js';

const {
  useSingleFileAuthState,
  makeWASocket,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeInMemoryStore
} = baileys;

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === AUTH ===
const sessionFile = './session/creds.json';
const { state, saveState } = useSingleFileAuthState(sessionFile);

// === LOGGER ===
const logger = pino({ level: 'silent' }, pino.destination('bot.log'));

// === DATABASE ===
const store = makeInMemoryStore({ logger: pino({ level: 'silent' }) });
store?.readFromFile('./session/store.json');
setInterval(() => {
  store?.writeToFile('./session/store.json');
}, 10_000);

// === INIT EXPRESS ===
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send(`🤖 ${process.env.BOT_NAME || 'AIYA BUG V1'} is running!`);
});

app.listen(PORT, () => {
  console.log(`🌐 Web server running on http://localhost:${PORT}`);
});

// === LOAD COMMANDS ===
const commands = new Map();
const pluginDir = path.join(__dirname, 'plugins');

fs.readdirSync(pluginDir).forEach(file => {
  if (file.endsWith('.js')) {
    import(`./plugins/${file}`).then(plugin => {
      if (plugin.command && plugin.handler) {
        commands.set(plugin.command, plugin.handler);
        console.log(`✅ Loaded command: ${plugin.command}`);
      }
    }).catch(err => {
      console.error(`❌ Failed to load ${file}:`, err);
    });
  }
});

// === START WHATSAPP BOT ===
async function startBot() {
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger,
    auth: state,
    printQRInTerminal: true,
    syncFullHistory: false,
    generateHighQualityLinkPreview: true,
    markOnlineOnConnect: true
  });

  store?.bind(sock.ev);

  sock.ev.on('connection.update', update => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'open') {
      console.log(`✅ WhatsApp connected as ${sock.user.id}`);
      sock.sendMessage(sock.user.id, {
        image: { url: BANNER_IMAGE },
        caption: `🤖 ${process.env.BOT_NAME || 'AIYA BUG V1'} is ready!`,
      });
      sock.sendMessage(sock.user.id, { audio: { url: BOT_SOUND }, mimetype: 'audio/mp4' });
    }

    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode;

      if (reason === DisconnectReason.loggedOut || reason === 401) {
        console.log('❌ Logged out. Restarting session...');
        fs.unlinkSync(sessionFile);
        startBot();
      } else {
        console.log('⚠️ Disconnected. Reconnecting...');
        startBot();
      }
    }
  });

  sock.ev.on('creds.update', saveState);

  sock.ev.on('messages.upsert', async ({ messages }) => {
    if (!messages || !messages[0]?.message) return;
    const msg = messages[0];
    const from = msg.key.remoteJid;
    const body =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      '';
    const isCmd = body.startsWith('.');

    if (!isCmd) return;

    const commandName = body.trim().split(' ')[0].slice(1).toLowerCase();
    const args = body.trim().split(' ').slice(1);

    if (commands.has(commandName)) {
      try {
        await commands.get(commandName)({
          sock,
          msg,
          args,
          from,
          command: commandName
        });
      } catch (e) {
        console.error(`❌ Error in command ${commandName}:`, e);
        await sock.sendMessage(from, { text: `⚠️ Error: ${e.message}` });
      }
    }
  });
}

startBot();
