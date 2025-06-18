#!/bin/bash

# Navigate to the project root directory (optional, if running from anywhere)
cd "$(dirname "$0")"

echo "🚀 Starting AIYA BUG V1 bot..."

# Ensure dependencies are installed (optional, can be removed if done manually)
npm install

# Run the bot
node index.js

# If you want the bot to restart automatically on crash, use a loop:
# while true; do
#   node index.js
#   echo "🔄 Bot crashed with exit code $?. Restarting..." >&2
#   sleep 3
# done