// test/node-figlet.test.ts
import {describe, it, expect, beforeAll} from 'vitest';
import fs from 'fs';
import path from 'path';
import figlet from '../src/node-figlet'; // Import from src instead of lib

describe('node-figlet', () => {
  // Helper function to read expected output files
  const readExpected = (filename: string): string => {
    return fs.readFileSync(path.join(__dirname, `expected/${filename}`), 'utf8');
  };

  const getMaxWidth = (input: string) => {
    return input.split("\n").reduce((acc, line) => {
      return (acc < line.length) ? line.length : acc;
    }, 0);
  }

  // Setup for font registration tests
  beforeAll(() => {
  });

  describe('standard font tests', () => {
    it('should render text with standard font and fitted vertical layout', async () => {
      const actual = await figlet.text("FIGlet\nFONTS", {
        font: "Standard",
        verticalLayout: "fitted",
      });

      const expected = readExpected('standard');
      expect(actual).toBe(expected);
    });

    it('should render text synchronously with standard font and fitted vertical layout', () => {
      const actual = figlet.textSync("FIGlet\nFONTS", {
        font: "Standard",
        verticalLayout: "fitted",
      });

      const expected = readExpected('standard');
      expect(actual).toBe(expected);
    });

    it('should render text with a parsed font', () => {
      const data = fs.readFileSync(
        path.join(__dirname, "../fonts/Standard.flf"),
        "utf8"
      );
      const font = figlet.parseFont("StandardParseFontName", data);

      const actual = figlet.textSync("FIGlet\nFONTS", {
        font: "StandardParseFontName",
        verticalLayout: "fitted",
      });

      const expected = readExpected('standard');
      expect(actual).toBe(expected);
    });
  });

  describe('graffiti font tests', () => {
    it('should render text with graffiti font and fitted horizontal layout', async () => {
      const actual = await figlet.text("ABC.123", {
        font: "Graffiti",
        horizontalLayout: "fitted",
      });

      const expected = readExpected('graffiti');
      expect(actual).toBe(expected);
    });

    it('should render text synchronously with graffiti font and fitted horizontal layout', () => {
      const actual = figlet.textSync("ABC.123", {
        font: "Graffiti",
        horizontalLayout: "fitted",
      });

      const expected = readExpected('graffiti');
      expect(actual).toBe(expected);
    });
  });

  describe('text wrapping tests', () => {
    it('should wrap text correctly with simple input', async () => {
      const actual = await figlet.text("Hello From The Figlet Library", {
        font: "Standard",
        width: 80,
      });

      const maxWidth = getMaxWidth(actual);
      expect(maxWidth).toBeLessThanOrEqual(80);

      const expected = readExpected('wrapSimple');
      expect(actual).toBe(expected);
    });

    it('should wrap text correctly with multiple lines', async () => {
      const actual = await figlet.text("Hello From The Figlet Library That Wrap Text", {
        font: "Standard",
        width: 80,
      });

      const maxWidth = getMaxWidth(actual);
      expect(maxWidth).toBeLessThanOrEqual(80);

      const expected = readExpected('wrapSimpleThreeLines');
      expect(actual).toBe(expected);
    });

    it('should wrap text correctly with multiple lines (word break - test1)', async () => {
      const actual = await figlet.text("Hello From The Figlet Library That Wrap Text", {
        font: "Standard",
        width: 80,
        whitespaceBreak: true,
      });

      const maxWidth = getMaxWidth(actual);
      expect(maxWidth).toBeLessThanOrEqual(80);

      const expected = readExpected('wrapWordThreeLines');
      expect(actual).toBe(expected);
    });

    it('should wrap text correctly with multiple lines (word break - test2)', async () => {
      const actual = await figlet.text("Hello LongLongLong Word Longerhello", {
        font: "Standard",
        width: 30,
        whitespaceBreak: true,
      });

      const maxWidth = getMaxWidth(actual);
      expect(maxWidth).toBeLessThanOrEqual(30);

      const expected = readExpected('wrapWhitespaceBreakWord');
      expect(actual).toBe(expected);
    });

    it('should wrap text correctly with multiple lines (word break - test3)', async () => {
      const actual = await figlet.text("xxxxxxxxxxxxxxxxxxxxxxxx", {
        font: "Standard",
        width: 30,
        whitespaceBreak: true,
      });

      const maxWidth = getMaxWidth(actual);
      expect(maxWidth).toBeLessThanOrEqual(30);

      const expected = readExpected('wrapWhitespaceLogString');
      expect(actual).toBe(expected);
    });
  });


  describe('misc font tests', () => {
    it('should load a custom font and render with it', async () => {
      const fontPath = path.join(__dirname, '../fonts/Dancing Font.flf');
      const fontData = fs.readFileSync(fontPath, 'utf8');
      figlet.parseFont('Dancing Font', fontData);

      const actual = await figlet.text("pizzapie", {
        font: "Dancing Font",
        horizontalLayout: "full",
      });

      const expected = readExpected('dancingFont');
      expect(actual).toBe(expected);
    });

    it('should load a font with a right-to-left parameter', async () => {
      const fontPath = path.join(__dirname, '../fonts/Dancing Font.flf');
      const fontData = fs.readFileSync(fontPath, 'utf8');
      figlet.parseFont('Dancing Font Reverse', fontData);

      const actual = figlet.textSync("pizzapie", {
        font: "Dancing Font Reverse",
        horizontalLayout: "full",
        printDirection: 1,
      });

      const expected = readExpected('dancingFontReverse');
      expect(actual).toBe(expected);
    });

    it('should correctly follow vertical smush rule 2 (Slant) ', async () => {
      const actual = figlet.textSync("Terminal\nChess", {
        font: "Slant",
      });

      const expected = readExpected('verticalSmushRule2');
      expect(actual).toBe(expected);
    });

    it('should get a list of loaded fonts', async () => {
      const fonts = await figlet.fonts();
      expect(Array.isArray(fonts)).toBe(true);
      expect(fonts.length).toBeGreaterThan(0);
      expect(fonts).toContain('Standard');
      expect(fonts).toContain('Graffiti');
    });

    it('all fonts should load and output text without error', async () => {
      const fonts = await figlet.fonts();

      const promises = fonts.map(async font => {
        const text = await figlet.text("abc ABC ...", {font});
        const maxWidth = getMaxWidth(text);
        expect(maxWidth).toBeGreaterThan(0);
      })
      await Promise.all(promises);

    });
  });

  describe('error handling', () => {
    it('should handle errors when font not found', async () => {
      try {
        await figlet.text("test", {
          font: "NonExistentFont",
        });
        // If we get here, the test should fail
        expect(true).toBe(false);
      } catch (err: any) {
        expect(err?.message).toContain('Font');
      }
    });

    it('should handle errors when font not found in sync mode', () => {
      try {
        figlet.textSync("test", {
          font: "NonExistentFont",
        });
        // If we get here, the test should fail
        expect(true).toBe(false);
      } catch (err: any) {
        expect(err?.message).toContain('Font');
      }
    });
  });
});
