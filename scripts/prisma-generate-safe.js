#!/usr/bin/env node

/**
 * Safe Prisma Generate for Windows
 * Handles EPERM errors by retrying and cleaning up locked files
 */

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const prismaClientPath = path.join(process.cwd(), 'node_modules', '.prisma', 'client');
const maxRetries = 3;
let retryCount = 0;

console.log('🔧 Starting safe Prisma generate...\n');

// Detect available package manager
function detectPackageManager() {
  const managers = [
    { name: 'bun', command: 'bunx', check: 'bun --version' },
    { name: 'pnpm', command: 'pnpm exec prisma', check: 'pnpm --version' },
    { name: 'yarn', command: 'yarn', check: 'yarn --version' },
    { name: 'npm', command: 'npx', check: 'npm --version' },
  ];

  for (const manager of managers) {
    try {
      execSync(manager.check, { stdio: 'ignore' });
      console.log(`✅ Detected package manager: ${manager.name}\n`);
      return manager;
    } catch (error) {
      // Package manager not available, try next
    }
  }

  // Fallback to npx (should always be available if Node.js installed)
  return { name: 'npx', command: 'npx', check: null };
}

function cleanPrismaClient() {
  try {
    if (fs.existsSync(prismaClientPath)) {
      console.log('🗑️  Cleaning .prisma/client folder...');
      fs.rmSync(prismaClientPath, { recursive: true, force: true });
      console.log('✅ Cleaned successfully\n');
      return true;
    }
  } catch (error) {
    console.warn('⚠️  Could not clean .prisma folder:', error.message);
    return false;
  }
  return true;
}

function runPrismaGenerate() {
  return new Promise((resolve, reject) => {
    const packageManager = detectPackageManager();
    const isWindows = process.platform === 'win32';
    
    let command, args;
    
    if (packageManager.name === 'bun') {
      command = 'bunx';
      args = ['prisma', 'generate'];
    } else if (packageManager.name === 'pnpm') {
      command = 'pnpm';
      args = ['exec', 'prisma', 'generate'];
    } else if (packageManager.name === 'yarn') {
      command = 'yarn';
      args = ['prisma', 'generate'];
    } else {
      // npm/npx
      command = 'npx';
      args = ['prisma', 'generate'];
    }
    
    console.log(`Running: ${command} ${args.join(' ')}\n`);
    
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true, // Always use shell for better compatibility
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Prisma generate exited with code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

async function generateWithRetry() {
  try {
    await runPrismaGenerate();
    console.log('\n✅ Prisma generate completed successfully!');
    process.exit(0);
  } catch (error) {
    retryCount++;
    
    if (error.message.includes('EPERM') && retryCount < maxRetries) {
      console.error(`\n❌ Error: ${error.message}`);
      console.log(`\n🔄 Retry ${retryCount}/${maxRetries}...`);
      console.log('💡 Tip: Close any running dev servers (bun run dev)\n');
      
      // Clean and retry after 2 seconds
      setTimeout(async () => {
        cleanPrismaClient();
        await generateWithRetry();
      }, 2000);
    } else {
      console.error('\n❌ Prisma generate failed after retries');
      console.error('\n💡 Troubleshooting steps:');
      console.error('   1. Close all terminals running "bun run dev"');
      console.error('   2. Close VS Code or your IDE');
      console.error('   3. Run: taskkill /F /IM node.exe');
      console.error('   4. Run: taskkill /F /IM bun.exe');
      console.error('   5. Try again: bun run db:generate:safe\n');
      process.exit(1);
    }
  }
}

// Check if any process is running
console.log('⚠️  Important: Stop any running dev servers before continuing');
console.log('   Press Ctrl+C to cancel, or wait 3 seconds to continue...\n');

setTimeout(() => {
  generateWithRetry();
}, 3000);
