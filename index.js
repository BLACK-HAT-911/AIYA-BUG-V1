/**
 * AIYA-BUG-V1 - Main Bot Entry
 * Author: BLACK-HAT-911
 * GitHub: https://github.com/BLACK-HAT-911/AIYA-BUG-V1
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { default as makeWASocket, useSingleFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from 'baileys';
import pino from 'pino';
import { BANNER_IMAGE, BOT_SOUND } from './lib/media.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env if present
import dotenv from 'dotenv';
dotenv.config();

// Express Server
const PORT = process.env.PORT || 3000;
const app = express();
app.get('/', (_, res) => res.send('🟢 AIYA BUG V1 is running.'));
app.listen(PORT, () => console.log(`🌐 Express server listening on port ${PORT}`));

// Baileys Auth
const { state, saveState } = useSingleFileAuthState('./session/creds.json');
const logger = pino({ level: 'silent' });
let conn;

// Load Plugins
const plugins = {};
const pluginsPath = path.join(__dirname, 'plugins');

async function loadPlugins() {
  const files = fs.readdirSync(pluginsPath).filter(f => f.endsWith('.js'));
  for (const file of files) {
    const plugin = await import(`file://${path.join(pluginsPath, file)}`);
    const name = file.replace('.js', '');
    plugins[name] = plugin.default;
    console.log(`✅ Plugin loaded: ${name}`);
  }
}

// Handle messages
async function handleMessage(m) {
  const msg = m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    m.message?.imageMessage?.caption ||
    '';
  
  if (!msg) return;
  
  const command = msg.trim().split(' ')[0].slice(1).toLowerCase();
  
  for (const name in plugins) {
    const plugin = plugins[name];
    if (plugin.command.test(command)) {
      await plugin.handler(m, {
        conn,
        command,
        text: msg.replace(command, '').trim(),
        usedPrefix: '.'
      });
    }
  }
}

// WhatsApp Socket Connection
async function startBot() {
  const { version } = await fetchLatestBaileysVersion();
  
  conn = makeWASocket({
    auth: state,
    logger,
    version,
    printQRInTerminal: true,
    browser: ['AIYA-BUG-V1', 'Chrome', '1.0.0']
  });
  
  conn.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
    if (qr) console.log('📲 Scan the QR code above to connect.');
    
    if (connection === 'open') {
      console.log('✅ WhatsApp connected.');
      
      // Send banner image
      try {
        await conn.sendMessage(conn.user.id, {
          image: { url: BANNER_IMAGE },
          caption: '🤖 *AIYA BUG V1* is Online!'
        });
        await conn.sendMessage(conn.user.id, {
          audio: { url: BOT_SOUND },
          mimetype: 'audio/mp4',
          ptt: true
        });
      } catch (err) {
        console.log('⚠️ Error sending startup media:', err.message);
      }
    }
    
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log(`🔌 Connection closed. Reconnect: ${shouldReconnect}`);
      if (shouldReconnect) startBot();
    }
  });
  
  conn.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    for (const m of messages) {
      if (!m.message || m.key.fromMe) continue;
      await handleMessage(m);
    }
  });
  
  conn.ev.on('creds.update', saveState);
}

await loadPlugins();
startBot();