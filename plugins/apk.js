/**
 * AIYA-BUG-V1 - APK Downloader Plugin
 * Command: .apk
 * API: https://api.nexoracle.com/downloader/apk?apikey=7902cbef76b269e176&q=
 * Example: .apk Instagram
 */

import fetch from 'node-fetch';

let handler = async (m, { conn, args, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`❌ *You must enter an app name!*\n\n📌 *Example:*\n${usedPrefix + command} Instagram`);
  }
  
  try {
    const query = encodeURIComponent(text.trim());
    const url = `https://api.nexoracle.com/downloader/apk?apikey=7902cbef76b269e176&q=${query}`;
    
    let res = await fetch(url);
    if (!res.ok) throw '❌ Failed to fetch APK data.';
    
    let json = await res.json();
    
    if (!json.result || !json.result.apkUrl) throw '❌ APK not found. Try a different app name.';
    
    const { apkUrl, appName, version, size } = json.result;
    
    await conn.sendMessage(m.chat, {
      document: { url: apkUrl },
      fileName: `${appName}.apk`,
      mimetype: 'application/vnd.android.package-archive',
      caption: `✅ *APK Downloader*

📦 *App:* ${appName}
📥 *Version:* ${version}
📁 *Size:* ${size}

_Provided by AIYA BUG V1_`
    }, { quoted: m });
    
  } catch (e) {
    console.error(e);
    m.reply(`❌ Error while downloading APK.\nTry another app or wait a moment.`);
  }
};

handler.help = ['apk'];
handler.tags = ['downloader'];
handler.command = /^apk$/i;

export default handler;