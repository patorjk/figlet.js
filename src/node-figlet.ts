/*
	Node plugin for figlet.js
*/

import * as fs from "fs";
import * as path from "path";

import figlet from "./figlet";
import { fileURLToPath } from "url";
import {
  CallbackFunction,
  FigletDefaults,
  FigletModule,
  FontName,
  FontMetadata,
  FigletOptions,
} from "./figlet-types";
import { getFontName } from "./renamed-fonts.js";

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
  callback?: (err: Error | null, font?: FontMetadata) => void,
): Promise<FontMetadata> {
  const actualFontName = getFontName(name);

  return new Promise<FontMetadata>((resolve, reject) => {
    if (nodeFiglet.figFonts[actualFontName]) {
      if (callback) {
        callback(null, nodeFiglet.figFonts[actualFontName].options);
      }
      resolve(nodeFiglet.figFonts[actualFontName].options);
      return;
    }

    fs.readFile(
      path.join(nodeFiglet.defaults().fontPath, actualFontName + ".flf"),
      { encoding: "utf-8" },
      (err: NodeJS.ErrnoException | null, fontData: string) => {
        if (err) {
          if (callback) {
            callback(err);
          }
          reject(err);
          return;
        }

        fontData = fontData + "";
        try {
          const font: FontMetadata = nodeFiglet.parseFont(
            actualFontName,
            fontData,
          );
          if (callback) {
            callback(null, font);
          }
          resolve(font);
        } catch (error) {
          const typedError =
            error instanceof Error ? error : new Error(String(error));
          if (callback) {
            callback(typedError);
          }
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
nodeFiglet.loadFontSync = function (font: string): FontMetadata {
  const actualFontName = getFontName(font);

  if (nodeFiglet.figFonts[actualFontName]) {
    return nodeFiglet.figFonts[actualFontName].options;
  }

  const fontData: string =
    fs.readFileSync(
      path.join(nodeFiglet.defaults().fontPath, actualFontName + ".flf"),
      {
        encoding: "utf-8",
      },
    ) + "";

  return nodeFiglet.parseFont(actualFontName, fontData);
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

export type {
  FigletOptions,
  FontMetadata,
  FontName,
  CallbackFunction,
  FigletDefaults,
};

export default nodeFiglet;
