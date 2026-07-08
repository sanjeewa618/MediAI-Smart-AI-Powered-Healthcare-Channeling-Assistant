/**
 * MediAI Project - One-Command Launcher
 *
 * Run from the project root:
 *   npm start
 *
 * It will:
 *   1. Auto-detect your local Wi-Fi IP
 *   2. Update the frontend .env
 *   3. Start the Backend server (in a separate terminal window)
 *   4. Start the Expo frontend (in this terminal, with QR code visible)
 */

import { networkInterfaces } from 'os';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getLocalIP() {
  const nets = networkInterfaces();
  const results = [];

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      const isValid =
        net.family === 'IPv4' &&
        !net.internal &&
        !name.toLowerCase().includes('vmware') &&
        !name.toLowerCase().includes('virtualbox') &&
        !name.toLowerCase().includes('vethernet') &&
        !name.toLowerCase().includes('loopback');

      if (isValid) results.push({ name, address: net.address });
    }
  }

  if (results.length === 0) {
    throw new Error('No valid local network interface found. Please connect to Wi-Fi.');
  }

  const wifi = results.find(r =>
    r.name.toLowerCase().includes('wi-fi') ||
    r.name.toLowerCase().includes('wifi') ||
    r.name.toLowerCase().includes('wlan') ||
    r.name.toLowerCase().includes('wireless')
  );

  return wifi ? wifi.address : results[0].address;
}

function updateFrontendEnv(ip) {
  const envPath = join(__dirname, 'healthcare-app', '.env');
  const apiUrl = `http://${ip}:4000`;

  let content = existsSync(envPath) ? readFileSync(envPath, 'utf-8') : '';

  if (content.includes('EXPO_PUBLIC_API_URL=')) {
    content = content.replace(/EXPO_PUBLIC_API_URL=.*/, `EXPO_PUBLIC_API_URL=${apiUrl}`);
  } else {
    content = `EXPO_PUBLIC_API_URL=${apiUrl}\n` + content;
  }

  writeFileSync(envPath, content, 'utf-8');
  return apiUrl;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

console.log('\n🔍 MediAI Auto-Setup\n' + '─'.repeat(44));

try {
  // Step 1: Detect IP
  const ip = getLocalIP();
  console.log(`✅ Local IP detected: ${ip}`);

  // Step 2: Update frontend .env
  const apiUrl = updateFrontendEnv(ip);
  console.log(`✅ frontend/.env updated → EXPO_PUBLIC_API_URL=${apiUrl}`);

  const backendDir  = join(__dirname, 'Backend');
  const frontendDir = join(__dirname, 'healthcare-app');

  // Step 3: Start Backend in a SEPARATE terminal window
  console.log('\n🖥️  Starting Backend server in a new window...');
  const backendCmd = `start "MediAI Backend" cmd /k "cd /d "${backendDir}" && npm run dev"`;
  spawn(backendCmd, [], {
    shell: true,
    detached: true,
    stdio: 'ignore',
  });

  // Step 4: Wait a moment, then start Expo in THIS terminal (interactive, with QR code)
  console.log('📱 Starting Expo frontend... (QR code will appear below)\n');
  console.log('─'.repeat(44));
  console.log('💡 Backend is running in a separate window.');
  console.log('📱 Scan the QR code below with Expo Go on your phone.');
  console.log('⛔ Press Ctrl+C here to stop Expo. Close the other window to stop Backend.');
  console.log('─'.repeat(44) + '\n');

  setTimeout(() => {
    const expo = spawn('npx', ['expo', 'start', '-c'], {
      cwd: frontendDir,
      shell: true,
      stdio: 'inherit',  // Inherit terminal so QR code and interactive mode work
    });

    expo.on('close', (code) => {
      process.exit(code || 0);
    });
  }, 3000);

} catch (err) {
  console.error('\n❌ Setup failed:', err.message);
  process.exit(1);
}
