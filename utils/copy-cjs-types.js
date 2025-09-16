import fs from 'fs';
import path from 'path';

const sourceDir = 'utils/cjs-types';
const destDir = 'dist/types/cjs';

/**
 * Recursively copy files and directories from source to destination
 * @param {string} src - Source directory path
 * @param {string} dest - Destination directory path
 */
function copyRecursive(src, dest) {
  // Check if source exists
  if (!fs.existsSync(src)) {
    console.error(`❌ Source directory does not exist: ${src}`);
    process.exit(1);
  }

  // Create destination directory if it doesn't exist
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, {recursive: true});
    console.log(`📁 Created directory: ${dest}`);
  }

  // Read source directory contents
  const entries = fs.readdirSync(src, {withFileTypes: true});

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      // Recursively copy subdirectories
      copyRecursive(srcPath, destPath);
    } else {
      // Copy file
      fs.copyFileSync(srcPath, destPath);
      console.log(`📄 Copied: ${srcPath} → ${destPath}`);
    }
  }
}

/**
 * Main function to execute the copy operation
 */
function main() {
  console.log('🚀 Starting CJS types copy operation...');
  console.log(`📂 Source: ${sourceDir}`);
  console.log(`📂 Destination: ${destDir}`);
  console.log('');

  try {
    copyRecursive(sourceDir, destDir);
    console.log('');
    console.log('✅ Copy operation completed successfully!');
  } catch (error) {
    console.error('❌ Error during copy operation:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
