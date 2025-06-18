/**
 * AIYA-BUG-V1 - Media Constants
 * Shared media: banner image, bot sound, etc.
 */

export const BANNER_IMAGE = 'https://files.catbox.moe/z0olwj.jpg'; // AIYA BUG V1 banner
export const BOT_SOUND = 'https://files.catbox.moe/dav1ns.mp3'; // Bot startup/menu sound

// Optional utility to return all media together
export const getMediaAssets = () => ({
  banner: BANNER_IMAGE,
  sound: BOT_SOUND
});