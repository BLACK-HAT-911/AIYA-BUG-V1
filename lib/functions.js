/**
 * AIYA-BUG-V1 - Utility Functions
 * Shared logic used across commands and system
 */

// Format milliseconds to HH:MM:SS
export function clockString(ms) {
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000);
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60;
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60;
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}

// Pick a random item from an array
export function pickRandom(list = []) {
  return list[Math.floor(Math.random() * list.length)];
}

// Shorten long text for display (with "...")
export function truncate(text = '', max = 100) {
  return text.length > max ? text.slice(0, max) + '...' : text;
}

// Sanitize JID to pure number
export function toNumber(jid = '') {
  return jid.replace(/[^0-9]/g, '');
}

// Capitalize first letter
export function capitalize(str = '') {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Logging helper (timestamped)
export function log(...args) {
  console.log(`[${new Date().toLocaleTimeString()}]`, ...args);
}