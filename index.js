/**
 * AIYA-BUG-V1 - Main WhatsApp Bot Entry
 * Author: BLACK-HAT-911
 * GitHub: https://github.com/BLACK-HAT-911/AIYA-BUG-V1
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import pino from 'pino';
import {
  makeWASocket,
  useSingleFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason
} from 'baileys';
import { BANNER_IMAGE, BOT_SOUND } from './lib/media.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Express server
const PORT = process.env.PORT || 3000;
const app = express();
app.get('/', (_, res) => res.send('🤖 AIYA BUG V1 is online!'));
app.listen(PORT, () => console.log(`🌐 Server running on port ${PORT}`));

// Baileys Auth
const { state, saveState } = useSingleFileAuthState('./session/creds.json');
const logger = pino({ level: 'silent' });
let conn;

// Load plugins dynamically
const plugins = {};
const pluginDir = path.join(__dirname, 'plugins');

async function loadPlugins() {
  const files = fs.readdirSync(pluginDir).filter(f => f.endsWith('.js'));
  for (const file of files) {
    try {
      const plugin = await import(`file://${path.join(pluginDir, file)}`);
      plugins[file.replace('.js', '')] = plugin.default;
      console.log(`✅ Loaded plugin: ${file}`);
    } catch (e) {
      console.error(`❌ Failed to load plugin ${file}:`, e);
    }
  }
}

// Handle incoming messages
async function handleMessage(m) {
  try {
    const msg =
      m.message?.conversation ||
      m.message?.extendedTextMessage?.text ||
      m.message?.imageMessage?.caption ||
      m.message?.videoMessage?.caption ||
      '';
    
    if (!msg) return;
    const command = msg.trim().split(' ')[0].slice(1).toLowerCase();
    
    for (const name in plugins) {
      const plugin = plugins[name];
      if (plugin.command?.test(command)) {
        await plugin.handler(m, {
          conn,
          command,
          text: msg.replace(command, '').trim(),
          usedPrefix: '.'
        });
      }
    }
  } catch (err) {
    console.error('❌ Error in handleMessage:', err.message);
  }
}

// Start the bot
async function startBot() {
  const { version } = await fetchLatestBaileysVersion();
  
  conn = makeWASocket({
    auth: state,
    logger,
    printQRInTerminal: true,
    version,
    browser: ['AIYA-BUG-V1', 'Chrome', '1.0.0']
  });
  
  conn.ev.on('creds.update', saveState);
  
  conn.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
    if (qr) console.log('📸 Scan the QR code to connect your WhatsApp');
    
    if (connection === 'open') {
      console.log('✅ Connected to WhatsApp');
      
      try {
        await conn.sendMessage(conn.user.id, {
          image: { url: BANNER_IMAGE },
          caption: '*🤖 AIYA BUG V1 is now online!*'
        });
        
        await conn.sendMessage(conn.user.id, {
          audio: { url: BOT_SOUND },
          mimetype: 'audio/mp4',
          ptt: true
        });
      } catch (e) {
        console.error('⚠️ Failed to send startup media:', e.message);
      }
    }
    
    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode;
      const reconnect = reason !== DisconnectReason.loggedOut;
      console.log(`🔌 Connection closed. Reconnect: ${reconnect}`);
      if (reconnect) await startBot();
    }
  });
  
  conn.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    for (const m of messages) {
      if (!m.message || m.key.fromMe) continue;
      await handleMessage(m);
    }
  });
}

// Start everything
await loadPlugins();
startBot();