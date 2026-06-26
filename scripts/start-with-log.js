#!/usr/bin/env node

/**
 * Cross-platform script to run production server with logging
 * Works on Windows, Mac, and Linux
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const logFile = path.join(process.cwd(), 'server.log');
const logStream = fs.createWriteStream(logFile, { flags: 'a' });

console.log(`Starting production server... Logs will be saved to: ${logFile}`);

// Set NODE_ENV
process.env.NODE_ENV = 'production';

// Determine the correct command based on OS
const isWindows = process.platform === 'win32';
const command = isWindows ? 'bun.exe' : 'bun';
const serverPath = path.join(process.cwd(), '.next', 'standalone', 'server.js');

const child = spawn(command, [serverPath], {
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: isWindows,
  env: { ...process.env, NODE_ENV: 'production' },
});

// Pipe stdout to both console and log file
child.stdout.on('data', (data) => {
  process.stdout.write(data);
  logStream.write(data);
});

// Pipe stderr to both console and log file
child.stderr.on('data', (data) => {
  process.stderr.write(data);
  logStream.write(data);
});

child.on('close', (code) => {
  logStream.end();
  console.log(`Production server exited with code ${code}`);
  process.exit(code);
});

// Handle Ctrl+C
process.on('SIGINT', () => {
  child.kill('SIGINT');
});

process.on('SIGTERM', () => {
  child.kill('SIGTERM');
});
