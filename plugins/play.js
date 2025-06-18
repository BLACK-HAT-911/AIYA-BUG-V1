/**
 * AIYA-BUG-V1 - YouTube Music Downloader
 * Command: .play
 * API: https://api.nexoracle.com/downloader/youtube-audio?apikey=7902cbef76b269e176&q=
 * Example: .play calm down
 */

import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`❌ *Enter the name of a song!*\n\n📌 *Example:*\n${usedPrefix + command} calm down`);
  }
  
  try {
    const query = encodeURIComponent(text.trim());
    const url = `https://api.nexoracle.com/downloader/youtube-audio?apikey=7902cbef76b269e176&q=${query}`;
    
    const res = await fetch(url);
    if (!res.ok) throw '❌ Failed to fetch audio.';
    const json = await res.json();
    
    if (!json.result || !json.result.url) throw '❌ Song not found. Try a different name.';
    
    const { title, url: audioUrl, duration, quality } = json.result;
    
    await conn.sendMessage(m.chat, {
      audio: { url: audioUrl },
      mimetype: 'audio/mp4',
      ptt: false,
      caption: `🎵 *Title:* ${title}\n⏱️ *Duration:* ${duration}\n🎧 *Quality:* ${quality}\n\n_Provided by AIYA BUG V1_`
    }, { quoted: m });
    
  } catch (e) {
    console.error(e);
    m.reply('❌ Error downloading the audio. Try again later.');
  }
};

handler.help = ['play'];
handler.tags = ['downloader'];
handler.command = /^play$/i;

export default handler;