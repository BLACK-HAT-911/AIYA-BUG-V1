/**
 * AIYA-BUG-V1 - Main Bot Entry (index.js)
 * Owner: BLACK-HAT-911
 * Repo: https://github.com/BLACK-HAT-911/AIYA-BUG-V1
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import pino from 'pino';
import { Boom } from '@hapi/boom';

import {
  makeWASocket,
  useSingleFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason
} from '@adiwajshing/baileys';

import { BANNER_IMAGE, BOT_SOUND } from './lib/media.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('AIYA BUG V1 WhatsApp Bot is running!');
});

app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});

// Setup Baileys auth state
const { state, saveState } = useSingleFileAuthState('./session/creds.json');

const logger = pino({ level: 'silent' });

let sock;

const plugins = {};
const pluginsFolder = path.join(__dirname, './plugins');

async function loadPlugins() {
  const files = fs.readdirSync(pluginsFolder).filter(file => file.endsWith('.js'));
  for (const file of files) {
    try {
      const pluginPath = path.join(pluginsFolder, file);
      const plugin = await import(`file://${pluginPath}`);
      const name = file.replace('.js', '');
      plugins[name] = plugin.default;
      console.log(`✅ Loaded plugin: ${name}`);
    } catch (e) {
      console.error(`❌ Failed to load plugin ${file}`, e);
    }
  }
}

async function handleMessage(m) {
  try {
    if (!m.message) return;
    const messageType = Object.keys(m.message)[0];
    if (messageType === 'protocolMessage') return;
    
    const msg =
      m.message.conversation ||
      m.message.extendedTextMessage?.text ||
      m.message.imageMessage?.caption ||
      '';
    
    if (!msg) return;
    
    const command = msg.trim().toLowerCase();
    
    for (const name in plugins) {
      const plugin = plugins[name];
      if (plugin && plugin.command instanceof RegExp) {
        if (plugin.command.test(command)) {
          await plugin.handler(m, {
            conn: sock,
            text: msg.slice(name.length).trim(),
            usedPrefix: '',
            command: name
          });
          break;
        }
      }
    }
  } catch (err) {
    console.error('Error handling message:', err);
  }
}

async function startSock() {
  const { version } = await fetchLatestBaileysVersion();
  
  sock = makeWASocket({
    logger,
    printQRInTerminal: true,
    auth: state,
    version,
    browser: ['AIYA BUG V1', 'Safari', '1.0.0']
  });
  
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;
    
    if (qr) {
      console.log('📱 Scan the QR code above to authenticate.');
    }
    
    if (connection === 'close') {
      const reason = (lastDisconnect?.error)?.output?.statusCode;
      if (reason === DisconnectReason.loggedOut) {
        console.log('🔴 Session logged out. Delete ./session and restart.');
        process.exit();
      } else {
        console.log('🔄 Connection closed, reconnecting...');
        startSock();
      }
    } else if (connection === 'open') {
      console.log('🟢 Connected to WhatsApp!');
      
      // Send banner image and sound to self on startup
      (async () => {
        try {
          await sock.sendMessage(sock.user.id, {
            image: { url: BANNER_IMAGE },
            caption: '🤖 AIYA BUG V1 is Online!'
          });
          
          await sock.sendMessage(sock.user.id, {
            audio: { url: BOT_SOUND },
            mimetype: 'audio/mp4',
            ptt: true
          });
        } catch (e) {
          console.log('⚠️ Failed to send startup media:', e.message);
        }
      })();
    }
  });
  
  sock.ev.on('creds.update', saveState);
  
  sock.ev.on('messages.upsert', async (m) => {
    if (m.type !== 'notify') return;
    
    for (const msg of m.messages) {
      if (!msg.message) continue;
      if (msg.key.fromMe) continue;
      
      await handleMessage(msg);
    }
  });
}

await loadPlugins();
startSock();