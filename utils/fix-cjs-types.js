import {readFile, writeFile, readdir} from 'fs/promises';
import {join} from 'path';

async function fixCjsTypes() {
  const cjsTypesDir = 'dist/types/cjs';

  try {
    const files = await readdir(cjsTypesDir);
    const dtsFiles = files.filter(file => file.endsWith('.d.ts'));

    for (const file of dtsFiles) {
      const filePath = join(cjsTypesDir, file);
      let content = await readFile(filePath, 'utf8');

      // Replace 'export default' with 'export =' for CommonJS compatibility
      content = content.replace(
        /export\s+default\s+([^;]+);?$/gm,
        'export = $1;'
      );

      content = content.replace(
        /figlet-types/g,
        'figlet-types.d.cts'
      );

      // Also handle cases where there might be other exports alongside default
      // In that case, we need to restructure to use export = with namespace merging
      if (content.includes('export ') && content.includes('export =')) {
        console.log(`⚠️  File ${file} has mixed exports, manual review recommended`);
      }

      await writeFile(filePath, content, 'utf8');
      console.log(`✅ Fixed CommonJS types in ${file}`);
    }

    console.log('✅ All CommonJS type declarations have been fixed!');
  } catch (error) {
    console.error('❌ Error fixing CommonJS types:', error.message);
    process.exit(1);
  }
}

fixCjsTypes();
