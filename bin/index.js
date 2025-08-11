#!/usr/bin/env node

import figlet from '../dist/node-figlet.mjs';
import {program} from 'commander';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get package version for CLI
const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8')
);

program
  .name('figlet')
  .description('JavaScript FIGdriver. Generates ASCII art from text using FIGlet fonts.')
  .version(packageJson.version)
  .argument('[text]', 'text to convert to ASCII art')
  .option('-f, --font <font>', 'font to use', 'Standard')
  .option('-w, --width <width>', 'output width', '80')
  .option('-h, --horizontalLayout <layout>', 'horizontal layout', 'default')
  .option('-v, --verticalLayout <layout>', 'vertical layout', 'default')
  .option('-l, --list', 'list available fonts')
  .option('-i, --info <font>', 'show font information')
  .action(async (text, options) => {
    try {
      // Handle list fonts option
      if (options.list) {
        console.log('Available fonts:');
        const fonts = await figlet.fonts();
        fonts.sort().forEach(font => console.log(`  ${font}`));
        return;
      }

      // Handle font info option
      if (options.info) {
        try {
          const fontOptions = await figlet.loadFont(options.info);
          console.log(`Font: ${options.info}`);
          console.log('Options:', JSON.stringify(fontOptions, null, 2));
          return;
        } catch (error) {
          console.error(`Error loading font '${options.info}':`, error.message);
          process.exit(1);
        }
      }

      // If no text provided and no special flags, show help
      if (!text) {
        program.help();
        return;
      }

      // Generate ASCII art
      const figletOptions = {
        font: options.font,
        horizontalLayout: options.horizontalLayout,
        verticalLayout: options.verticalLayout,
        width: parseInt(options.width, 10) || 80
      };

      // Load the font first
      await figlet.loadFont(options.font);

      // Generate the ASCII art
      const result = figlet.textSync(text, figletOptions);
      console.log(result);

    } catch (error) {
      if (error.code === 'ENOENT') {
        console.error(`Font '${options.font}' not found.`);
        console.error('Use --list to see available fonts.');
      } else {
        console.error('Error:', error.message);
      }
      process.exit(1);
    }
  });

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Unexpected error:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
  process.exit(1);
});

// Parse command line arguments
program.parse();
