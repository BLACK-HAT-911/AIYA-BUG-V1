/**
 * AIYA-BUG-V1 - Bugx Prank Plugin
 * Command: .bugx 2637xxxxxxxx
 * Description: Sends harmless prank messages to a target user
 */

import { pickRandom } from '../lib/functions.js';

let bugMessages = [
  '🐞 Harmless AIYA BUG injected into your phone!',
  '⚠️ System overload... nah just kidding!',
  '💣 Critical bug triggered! Wait... it’s a prank 😎',
  '👾 You’ve been bugged by AIYA BUG V1!',
  '🛠️ Bug scan complete — too many scams detected!',
  '🚨 Virus alert: AIYA BUG detected… but we cool 😌',
  '🤖 Bot activated — you may feel slight vibrations...'
];

let handler = async (m, { conn, args }) => {
  if (!args[0]) return m.reply('❌ Please provide a number.\n📌 Example:\n.bugx 2637xxxxxxxx');
  
  const target = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
  if (!target.endsWith('@s.whatsapp.net')) return m.reply('❌ Invalid number format.');
  
  for (let i = 0; i < 5; i++) {
    let msg = pickRandom(bugMessages);
    await conn.sendMessage(target, { text: msg });
  }
  
  await m.reply(`✅ Sent harmless prank bugx messages to +${args[0]}`);
};

handler.help = ['bugx'];
handler.tags = ['fun'];
handler.command = /^bugx$/i;

export default handler;