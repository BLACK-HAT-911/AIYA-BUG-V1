/**
 * AIYA-BUG-V1 - JSON DB (lowdb)
 * Handles local JSON database for user, group, and config data.
 */

import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import fs from 'fs';

const dbFile = path.join('./', 'aiya-db.json');

// Create file if it doesn't exist
if (!fs.existsSync(dbFile)) fs.writeFileSync(dbFile, '{}');

// Initialize DB with default structure
const adapter = new JSONFile(dbFile);
export const db = new Low(adapter);

await db.read();

db.data ||= {
  users: {}, // key: number, value: { name, lastCommand, joined }
  stats: {}, // command usage count
  config: {} // optional settings (maintenance mode, etc.)
};

// Save changes manually: await db.write()

// Example function to register a user if not in DB
export function registerUser(jid) {
  if (!db.data.users[jid]) {
    db.data.users[jid] = {
      name: null,
      lastCommand: null,
      joined: Date.now()
    };
    db.write(); // Save change
  }
}

// Example function to increment command usage
export function trackCommand(cmd) {
  if (!db.data.stats[cmd]) db.data.stats[cmd] = 0;
  db.data.stats[cmd]++;
  db.write();
}