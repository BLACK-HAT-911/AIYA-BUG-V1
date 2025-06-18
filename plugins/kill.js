/**
 * AIYA-BUG-V1 - Kill Command Plugin
 * Command: .kill
 * Description: Sends funny “kill” messages to end the chat jokingly.
 */

let killMessages = [
  '💥 Boom! Chat terminated successfully!',
  '⚡️ Zap! You have been slain by AIYA BUG!',
  '☠️ Chat killed! Come back when you’re ready!',
  '🔥 Chat destroyed! Try to survive next time!',
  '💀 Mission complete: Chat eliminated!',
];

let handler = async (m) => {
  let msg = killMessages[Math.floor(Math.random() * killMessages.length)];
  await m.reply(msg);
};

handler.help = ['kill'];
handler.tags = ['fun'];
handler.command = /^kill$/i;

export default handler;