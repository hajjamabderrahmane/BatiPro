
const os = require('os');
const fs = require('fs');
const path = require('path');

const interfaces = os.networkInterfaces();
const candidates = [];

for (const [name, addresses] of Object.entries(interfaces)) {
  for (const address of addresses || []) {
    if (
      address.family !== 'IPv4' ||
      address.internal ||
      address.address.startsWith('169.254.')
    ) {
      continue;
    }

    const privateIP =
      address.address.startsWith('192.168.') ||
      address.address.startsWith('10.') ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(address.address);

    if (privateIP) {
      candidates.push({
        name,
        address: address.address,
        priority: /wi-?fi|wireless|wlan/i.test(name) ? 0 : 1,
      });
    }
  }
}

candidates.sort((a, b) => a.priority - b.priority);

if (candidates.length === 0) {
  console.error('No private IPv4 address found. Check your Wi-Fi connection.');
  process.exit(1);
}

const ip = candidates[0].address;
const envPath = path.join(__dirname, '..', '.env');
const variable = 'EXPO_PUBLIC_API_URL';
const value = `http://${ip}:8000/api`;

let content = fs.existsSync(envPath)
  ? fs.readFileSync(envPath, 'utf8')
  : '';

const linePattern = /^EXPO_PUBLIC_API_URL=.*$/m;

if (linePattern.test(content)) {
  content = content.replace(linePattern, `${variable}=${value}`);
} else {
  content = `${content.trimEnd()}${content.trim() ? '\n' : ''}${variable}=${value}\n`;
}

fs.writeFileSync(envPath, content);

console.log(`Detected PC IP: ${ip}`);
console.log(`API URL saved to .env: ${value}`);
