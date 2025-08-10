/*
	Node plugin for figlet.js
*/

import * as fs from "fs";
import * as path from "path";

// Import the main figlet module - you'll need to type this based on your figlet.js structure
import figlet from "./figlet.js";
import { fileURLToPath } from "url";
import { FigletModule, FontOptions } from "./figlet-types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fontPath: string = path.join(__dirname, "/../fonts/");

// Type assertion for the figlet module
const nodeFiglet = figlet as FigletModule;

nodeFiglet.defaults({ fontPath });

/*
    Loads a font into the figlet object.

    Parameters:
    - name (string): Name of the font to load.
    - next (function): Optional callback function.
*/
nodeFiglet.loadFont = function (
  name: string,
  callback?: (err: Error | null, font?: FontOptions) => void,
): Promise<FontOptions> {
  return new Promise<FontOptions>((resolve, reject) => {
    if (nodeFiglet.figFonts[name]) {
      callback?.(null, nodeFiglet.figFonts[name].options);
      resolve(nodeFiglet.figFonts[name].options);
      return;
    }

    fs.readFile(
      path.join(nodeFiglet.defaults().fontPath, name + ".flf"),
      { encoding: "utf-8" },
      (err: NodeJS.ErrnoException | null, fontData: string) => {
        if (err) {
          callback?.(err);
          reject(err);
          return;
        }

        fontData = fontData + "";
        try {
          const font: FontOptions = nodeFiglet.parseFont(name, fontData);
          callback?.(null, font);
          resolve(font);
        } catch (error) {
          const typedError =
            error instanceof Error ? error : new Error(String(error));
          callback?.(typedError);
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
nodeFiglet.loadFontSync = function (font: string): FontOptions {
  if (nodeFiglet.figFonts[font]) {
    return nodeFiglet.figFonts[font].options;
  }

  const fontData: string =
    fs.readFileSync(path.join(nodeFiglet.defaults().fontPath, font + ".flf"), {
      encoding: "utf-8",
    }) + "";

  return nodeFiglet.parseFont(font, fontData);
};

/*
    Returns an array containing all of the font names
*/
nodeFiglet.fonts = function (
  next?: (err: Error | null, fonts?: string[]) => void,
): Promise<string[]> {
  return new Promise<string[]>((resolve, reject) => {
    const fontList: string[] = [];
    fs.readdir(
      nodeFiglet.defaults().fontPath,
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

nodeFiglet.fontsSync = function (): string[] {
  const fontList: string[] = [];
  fs.readdirSync(nodeFiglet.defaults().fontPath).forEach((file: string) => {
    if (/\.flf$/.test(file)) {
      fontList.push(file.replace(/\.flf$/, ""));
    }
  });

  return fontList;
};

export default nodeFiglet;
