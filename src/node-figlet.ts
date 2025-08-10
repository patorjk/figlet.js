/*
	Node plugin for figlet.js
*/

import * as fs from "fs";
import * as path from "path";

// Import the main figlet module - you'll need to type this based on your figlet.js structure
import figlet from "./figlet.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fontDir: string = path.join(__dirname, "/../fonts/");

// Type definitions for figlet objects
interface FontOptions {
  [key: string]: any; // Define more specific types based on your font options structure
}

interface FigFont {
  options: FontOptions;
}

interface FigletModule {
  figFonts: { [fontName: string]: FigFont };
  parseFont: (name: string, fontData: string) => FontOptions;
  loadFont: (
    name: string,
    next?: (err: Error | null, font?: FontOptions) => void,
  ) => Promise<FontOptions>;
  loadFontSync: (name: string) => FontOptions;
  fonts: (
    next?: (err: Error | null, fonts?: string[]) => void,
  ) => Promise<string[]>;
  fontsSync: () => string[];
}

// Type assertion for the figlet module
const typedFiglet = figlet as FigletModule;

/*
    Loads a font into the figlet object.

    Parameters:
    - name (string): Name of the font to load.
    - next (function): Optional callback function.
*/
typedFiglet.loadFont = function (
  name: string,
  next?: (err: Error | null, font?: FontOptions) => void,
): Promise<FontOptions> {
  return new Promise<FontOptions>((resolve, reject) => {
    if (typedFiglet.figFonts[name]) {
      next && next(null, typedFiglet.figFonts[name].options);
      resolve(typedFiglet.figFonts[name].options);
      return;
    }

    fs.readFile(
      path.join(fontDir, name + ".flf"),
      { encoding: "utf-8" },
      (err: NodeJS.ErrnoException | null, fontData: string) => {
        if (err) {
          next && next(err);
          reject(err);
          return;
        }

        fontData = fontData + "";
        try {
          const font: FontOptions = typedFiglet.parseFont(name, fontData);
          next && next(null, font);
          resolve(font);
        } catch (error) {
          const typedError =
            error instanceof Error ? error : new Error(String(error));
          next && next(typedError);
          reject(typedError);
        }
      },
    );
  });
};

/*
 Loads a font synchronously into the figlet object.

 Parameters:
 - name (string): Name of the font to load.
 */
typedFiglet.loadFontSync = function (name: string): FontOptions {
  if (typedFiglet.figFonts[name]) {
    return typedFiglet.figFonts[name].options;
  }

  const fontData: string =
    fs.readFileSync(path.join(fontDir, name + ".flf"), {
      encoding: "utf-8",
    }) + "";

  return typedFiglet.parseFont(name, fontData);
};

/*
    Returns an array containing all of the font names
*/
typedFiglet.fonts = function (
  next?: (err: Error | null, fonts?: string[]) => void,
): Promise<string[]> {
  return new Promise<string[]>((resolve, reject) => {
    const fontList: string[] = [];
    fs.readdir(
      fontDir,
      (err: NodeJS.ErrnoException | null, files: string[]) => {
        if (err) {
          next && next(err);
          reject(err);
          return;
        }

        files.forEach((file: string) => {
          if (/\.flf$/.test(file)) {
            fontList.push(file.replace(/\.flf$/, ""));
          }
        });

        next && next(null, fontList);
        resolve(fontList);
      },
    );
  });
};

typedFiglet.fontsSync = function (): string[] {
  const fontList: string[] = [];
  fs.readdirSync(fontDir).forEach((file: string) => {
    if (/\.flf$/.test(file)) {
      fontList.push(file.replace(/\.flf$/, ""));
    }
  });

  return fontList;
};

export default typedFiglet;
