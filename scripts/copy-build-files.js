#!/usr/bin/env node

/**
 * Cross-platform script to copy build files
 * Works on Windows, Mac, and Linux
 * Replaces: cp -r .next/static .next/standalone/.next/ && cp -r public .next/standalone/
 */

const fs = require('fs');
const path = require('path');

/**
 * Recursively copy directory
 */
function copyDir(src, dest) {
  // Create destination directory if it doesn't exist
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  // Read source directory
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('Copying build files...');

try {
  // Copy .next/static to .next/standalone/.next/static
  const staticSrc = path.join(process.cwd(), '.next', 'static');
  const staticDest = path.join(process.cwd(), '.next', 'standalone', '.next', 'static');
  
  if (fs.existsSync(staticSrc)) {
    console.log('Copying .next/static...');
    copyDir(staticSrc, staticDest);
    console.log('✓ Copied .next/static');
  } else {
    console.warn('⚠ Warning: .next/static not found, skipping...');
  }

  // Copy public to .next/standalone/public
  const publicSrc = path.join(process.cwd(), 'public');
  const publicDest = path.join(process.cwd(), '.next', 'standalone', 'public');
  
  if (fs.existsSync(publicSrc)) {
    console.log('Copying public...');
    copyDir(publicSrc, publicDest);
    console.log('✓ Copied public');
  } else {
    console.warn('⚠ Warning: public directory not found, skipping...');
  }

  console.log('✓ Build files copied successfully');
} catch (error) {
  console.error('✗ Error copying build files:', error.message);
  process.exit(1);
}
