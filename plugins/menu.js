/**
 * AIYA-BUG-V1 - Menu Plugin
 * Command: .menu
 * Repo: https://github.com/BLACK-HAT-911/AIYA-BUG-V1
 */

import { clockString, pickRandom } from '../lib/functions.js';
import { BANNER_IMAGE, BOT_SOUND } from '../lib/media.js';

let handler = async (m, { conn }) => {
  const uptime = clockString(process.uptime() * 1000);
  const emoji = pickRandom(['🔥', '💀', '😈', '👾', '⚡️']);
  const ownerMention = m.sender.replace(/@s\.whatsapp\.net$/, '');
  
  const menuText = `—(𝑨)  
｟ *AIYA BUG V1* ${emoji} ｠  
⪨ *Owner* : @${ownerMention}  
⪨ *Uptime* : ${uptime}  
⪨ *Prefix* : undefined  
⪨ *Version* : 1  
⪨ *Commands* : 6

—( ☇ *Menu* ☇ )  
> *.apk*  
> *.play*  
> *.video*  
> *.Bugx*  
> *.Kill*  
> *.Crash*

*Powered by TESTING SHIT* 😎`;
  
  // Send banner image with menu text
  await conn.sendMessage(m.chat, {
    image: { url: BANNER_IMAGE },
    caption: menuText,
    mentions: [m.sender]
  }, { quoted: m });
  
  // Send bot sound
  await conn.sendMessage(m.chat, {
    audio: { url: BOT_SOUND },
    mimetype: 'audio/mp4',
    ptt: true
  }, { quoted: m });
};

handler.help = ['menu'];
handler.tags = ['main'];
handler.command = /^menu$/i;

export default handler;