/**
 * AIYA-BUG-V1 - YouTube Video Downloader
 * Command: .video
 * API: https://api.nexoracle.com/downloader/youtube-video?apikey=7902cbef76b269e176&q=
 * Example: .video calm down
 */

import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`❌ *Enter the name of a video!*\n\n📌 *Example:*\n${usedPrefix + command} calm down`);
  }
  
  try {
    const query = encodeURIComponent(text.trim());
    const api = `https://api.nexoracle.com/downloader/youtube-video?apikey=7902cbef76b269e176&q=${query}`;
    
    const res = await fetch(api);
    if (!res.ok) throw '❌ Failed to fetch video.';
    const json = await res.json();
    
    if (!json.result || !json.result.url) throw '❌ Video not found. Try another search.';
    
    const { title, url: videoUrl, resolution, duration } = json.result;
    
    await conn.sendMessage(m.chat, {
      video: { url: videoUrl },
      mimetype: 'video/mp4',
      caption: `🎬 *Title:* ${title}\n📺 *Resolution:* ${resolution}\n⏱️ *Duration:* ${duration}\n\n_Provided by AIYA BUG V1_`
    }, { quoted: m });
    
  } catch (e) {
    console.error(e);
    m.reply('❌ Error while downloading video. Please try again later.');
  }
};

handler.help = ['video'];
handler.tags = ['downloader'];
handler.command = /^video$/i;

export default handler;