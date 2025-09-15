import {readdir, rename} from 'fs/promises';
import {join, extname, basename} from 'path';

async function renameCjsTypes() {
  const cjsTypesDir = 'dist/types/cjs';

  try {
    const files = await readdir(cjsTypesDir);
    const dtsFiles = files.filter(file => file.endsWith('.d.ts'));

    if (dtsFiles.length === 0) {
      console.log('ℹ️  No .d.ts files found in', cjsTypesDir);
      return;
    }

    console.log(`🔄 Renaming ${dtsFiles.length} CommonJS type declaration files...`);

    for (const file of dtsFiles) {
      const oldPath = join(cjsTypesDir, file);
      const baseName = basename(file, '.d.ts');
      const newFileName = `${baseName}.d.cts`;
      const newPath = join(cjsTypesDir, newFileName);

      await rename(oldPath, newPath);
      console.log(`✅ Renamed: ${file} → ${newFileName}`);
    }

    console.log('✅ All CommonJS type declarations renamed to .d.cts!');
  } catch (error) {
    console.error('❌ Error renaming CommonJS types:', error.message);
    process.exit(1);
  }
}

renameCjsTypes();
