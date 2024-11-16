const https = require('https');
const fs = require('fs');
const path = require('path');

const sounds = {
  'spin.mp3': 'https://example.com/spin.mp3',
  'win.mp3': 'https://example.com/win.mp3',
  'click.mp3': 'https://example.com/click.mp3'
};

const soundsDir = path.join(__dirname, '../public/sounds');

if (!fs.existsSync(soundsDir)) {
  fs.mkdirSync(soundsDir, { recursive: true });
}

Object.entries(sounds).forEach(([filename, url]) => {
  const file = fs.createWriteStream(path.join(soundsDir, filename));
  https.get(url, response => response.pipe(file));
}); 