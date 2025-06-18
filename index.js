/**
 * AIYA-BUG-V1 - WhatsApp Bot
 * Author: BLACK-HAT-911
 * Repo: https://github.com/BLACK-HAT-911/AIYA-BUG-V1
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

// Setup Express
const PORT = process.env.PORT || 3000;
const app = express();
app.get('/', (_, res) => res.send('🤖 AIYA BUG V1 is running'));
app.listen(PORT, () => console.log(`🌐 Listening on port ${PORT}`));

// Setup Baileys Auth
const { state, saveState } = useSingleFileAuthState('./session/creds.json');
const logger = pino({ level: 'silent' });
let conn;

// Load Plugins
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

// Initialize WhatsApp socket
async function startBot() {
  const { version } = await fetchLatestBaileysVersion();
  
  conn = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    logger,
    browser: ['AIYA-BUG-V1', 'MacOS', '1.0.0'],
    version
  });
  
  conn.ev.on('creds.update', saveState);
  
  conn.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
    if (qr) console.log('📸 Scan the QR code above to connect your WhatsApp');
    
    if (connection === 'open') {
      console.log('✅ WhatsApp connection established');
      
      try {
        await conn.sendMessage(conn.user.id, {
          image: { url: BANNER_IMAGE },
          caption: '🤖 *AIYA BUG V1 is Online!*'
        });
        
        await conn.sendMessage(conn.user.id, {
          audio: { url: BOT_SOUND },
          mimetype: 'audio/mp4',
          ptt: true
        });
      } catch (e) {
        console.log('⚠️ Failed to send startup media:', e.message);
      }
    }
    
    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode;
      const reconnect = reason !== DisconnectReason.loggedOut;
      console.log(`🔌 Disconnected. Reconnect: ${reconnect}`);
      if (reconnect) await startBot();
    }
  });
  
  conn.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    for (const msg of messages) {
      if (!msg.message || msg.key.fromMe) continue;
      await handleMessage(msg);
    }
  });
}

await loadPlugins();
startBot();