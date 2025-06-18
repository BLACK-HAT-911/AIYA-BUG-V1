/**
 * AIYA-BUG-V1 - Crash Command Plugin
 * Command: .crash
 * Description: Simulates a harmless crash with funny glitch messages.
 */

let crashMessages = [
  '💥 SYSTEM ERROR: Unexpected bug detected!',
  '⚠️ WARNING: Critical failure in AIYA BUG system!',
  '🛑 CRASH IMMINENT... rebooting... rebooting...',
  `
   ██████  ██████  ██   ██  ██████
  ██      ██    ██ ██   ██ ██
  ██      ██    ██ ███████ ██   ███
  ██      ██    ██ ██   ██ ██    ██
   ██████  ██████  ██   ██  ██████
  
  `,
  '🤖 AIYA BUG has crashed! But don’t worry, it’s harmless!',
];

let handler = async (m) => {
  let msg = crashMessages[Math.floor(Math.random() * crashMessages.length)];
  await m.reply(msg);
};

handler.help = ['crash'];
handler.tags = ['fun'];
handler.command = /^crash$/i;

export default handler;