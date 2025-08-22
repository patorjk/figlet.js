// test/node-figlet.test.ts
import {describe, it, vi, beforeEach, afterEach, expect, beforeAll, MockInstance} from 'vitest';
import fs from 'fs';
import path from 'path';
import figlet from '../src/figlet'; // Import from src instead of lib
import fontData from '../importable-fonts/Standard'
import miniwi from '../importable-fonts/miniwi'

describe('figlet', () => {
  let fetchSpy: MockInstance<{
    (input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
    (input: string | URL | globalThis.Request, init?: RequestInit): Promise<Response>;
  }>;

  // Helper function to read expected output files
  const readExpected = (filename: string): string => {
    return fs.readFileSync(path.join(__dirname, `expected/${filename}`), 'utf8');
  };

  // Setup for font registration tests
  beforeEach(() => {
    fetchSpy = vi.spyOn(global, 'fetch');
  });

  afterEach(() => {
    fetchSpy.mockRestore(); // Restore the original fetch after each test
    figlet.clearLoadedFonts();
  });

  describe('preloadFonts tests', () => {

    it('preloadFonts should execute without error when valid data is given', async () => {

      const localPath = import.meta.url;
      const lastSlashIndex = localPath.lastIndexOf("/");
      const directoryPath = localPath.substring(0, lastSlashIndex);

      const mockResponse = {
        ok: true,
        statusText: 'OK',
        text: () => Promise.resolve(fontData),
      };
      // @ts-ignore
      fetchSpy.mockReturnValue(Promise.resolve(mockResponse));

      figlet.defaults({
        fontPath: `${directoryPath}/../fonts`,
      });

      expect(figlet.loadedFonts()).toStrictEqual([]);

      await figlet.preloadFonts(['Standard', 'Graffiti']);

      expect(figlet.loadedFonts()).toStrictEqual(['Standard', 'Graffiti']);
    });

    it('preloadFonts should execute without error and execute its callback', async () => {

      const localPath = import.meta.url;
      const lastSlashIndex = localPath.lastIndexOf("/");
      const directoryPath = localPath.substring(0, lastSlashIndex);
      const mockCallback = vi.fn();

      const mockResponse = {
        ok: true,
        statusText: 'OK',
        text: () => Promise.resolve(fontData),
      };
      // @ts-ignore
      fetchSpy.mockReturnValue(Promise.resolve(mockResponse));

      figlet.defaults({
        fontPath: `${directoryPath}/../fonts`,
      });

      expect(figlet.loadedFonts()).toStrictEqual([]);

      figlet.preloadFonts(['Standard', 'Graffiti'], mockCallback);

      await new Promise(resolve => setTimeout(resolve, 100)); // give time for the callback to execute

      expect(mockCallback).toHaveBeenCalledWith();
      expect(figlet.loadedFonts()).toStrictEqual(['Standard', 'Graffiti']);
    });

    it('preloadFonts should throw an error when fetch fails', async () => {

      const localPath = import.meta.url;
      const lastSlashIndex = localPath.lastIndexOf("/");
      const directoryPath = localPath.substring(0, lastSlashIndex);

      const mockResponse = {
        ok: false,
        statusText: 'Oopsy!',
        text: () => Promise.resolve(fontData),
      };
      // @ts-ignore
      fetchSpy.mockReturnValue(Promise.resolve(mockResponse));

      figlet.defaults({
        fontPath: `${directoryPath}/../fonts`,
      });

      await expect(figlet.preloadFonts(['Standard', 'Graffiti'])).rejects.toThrow();
    });

    it('preloadFonts should pass the error to its callback if its provided', async () => {

      const localPath = import.meta.url;
      const lastSlashIndex = localPath.lastIndexOf("/");
      const directoryPath = localPath.substring(0, lastSlashIndex);
      const mockCallback = vi.fn();

      const mockResponse = {
        ok: false,
        statusText: 'Oopsy!',
        text: () => Promise.resolve(fontData),
      };
      // @ts-ignore
      fetchSpy.mockReturnValue(Promise.resolve(mockResponse));

      figlet.defaults({
        fontPath: `${directoryPath}/../fonts`,
      });

      figlet.preloadFonts(['Standard', 'Graffiti'], mockCallback);

      await new Promise(resolve => setTimeout(resolve, 100)); // give time for the callback to execute

      expect(mockCallback).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  // -------------------------------------------------------------------------------------------------------------------

  describe('loadFont tests', () => {

    const standardMeta = {
      hardBlank: '$',
      height: 6,
      baseline: 5,
      maxLength: 16,
      oldLayout: 15,
      numCommentLines: 13,
      printDirection: 0,
      fullLayout: 24463,
      codeTagCount: 229,
      fittingRules: {
        vLayout: 3,
        vRule5: true,
        vRule4: true,
        vRule3: true,
        vRule2: true,
        vRule1: true,
        hLayout: 3,
        hRule6: false,
        hRule5: false,
        hRule4: true,
        hRule3: true,
        hRule2: true,
        hRule1: true
      }
    };

    it('loadFont should execute without error for valid inputs', async () => {

      const localPath = import.meta.url;
      const lastSlashIndex = localPath.lastIndexOf("/");
      const directoryPath = localPath.substring(0, lastSlashIndex);

      const mockResponse = {
        ok: true,
        statusText: 'OK',
        text: () => Promise.resolve(fontData),
      };
      // @ts-ignore
      fetchSpy.mockReturnValue(Promise.resolve(mockResponse));

      figlet.defaults({
        fontPath: `${directoryPath}/../fonts`,
      });

      expect(figlet.loadedFonts()).toStrictEqual([]);

      const meta = await figlet.loadFont('Standard');
      expect(meta).toEqual(standardMeta);
      expect(figlet.loadedFonts()).toStrictEqual(['Standard']);
    });

    it('loadFont should execute without error for valid inputs and pass its return data to its callback', async () => {

      const localPath = import.meta.url;
      const lastSlashIndex = localPath.lastIndexOf("/");
      const directoryPath = localPath.substring(0, lastSlashIndex);
      const mockCallback = vi.fn();

      const mockResponse = {
        ok: true,
        statusText: 'OK',
        text: () => Promise.resolve(fontData),
      };
      // @ts-ignore
      fetchSpy.mockReturnValue(Promise.resolve(mockResponse));

      figlet.defaults({
        fontPath: `${directoryPath}/../fonts`,
      });

      figlet.loadFont('Standard', mockCallback);

      await new Promise(resolve => setTimeout(resolve, 100)); // give time for the callback to execute

      expect(mockCallback).toHaveBeenCalledWith(null, standardMeta);

    });

    it('loadFont should throw an error when fetch fails', async () => {

      const localPath = import.meta.url;
      const lastSlashIndex = localPath.lastIndexOf("/");
      const directoryPath = localPath.substring(0, lastSlashIndex);

      const mockResponse = {
        ok: false,
        statusText: 'Oopsy!',
        text: () => Promise.resolve(fontData),
      };
      // @ts-ignore
      fetchSpy.mockReturnValue(Promise.resolve(mockResponse));

      figlet.defaults({
        fontPath: `${directoryPath}/../fonts`,
      });

      await expect(figlet.loadFont('Standard')).rejects.toThrow();
    });

    it('loadFont should pass the error to its callback if its provided', async () => {

      const localPath = import.meta.url;
      const lastSlashIndex = localPath.lastIndexOf("/");
      const directoryPath = localPath.substring(0, lastSlashIndex);
      const mockCallback = vi.fn();

      const mockResponse = {
        ok: false,
        statusText: 'Oopsy!',
        text: () => Promise.resolve(fontData),
      };
      // @ts-ignore
      fetchSpy.mockReturnValue(Promise.resolve(mockResponse));

      figlet.defaults({
        fontPath: `${directoryPath}/../fonts`,
      });

      figlet.loadFont('Standard', mockCallback);

      await new Promise(resolve => setTimeout(resolve, 100)); // give time for the callback to execute

      expect(mockCallback).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  // -------------------------------------------------------------------------------------------------------------------
  describe('text tests', () => {

    const expected = readExpected('standard_default');
    const text = 'FIGlet\nFonts';

    it('text should execute without error for valid inputs', async () => {

      const localPath = import.meta.url;
      const lastSlashIndex = localPath.lastIndexOf("/");
      const directoryPath = localPath.substring(0, lastSlashIndex);

      const mockResponse = {
        ok: true,
        statusText: 'OK',
        text: () => Promise.resolve(fontData),
      };
      // @ts-ignore
      fetchSpy.mockReturnValue(Promise.resolve(mockResponse));

      figlet.defaults({
        fontPath: `${directoryPath}/../fonts`,
      });

      expect(figlet.loadedFonts()).toStrictEqual([]);

      const output = await figlet.text(text, 'Standard');

      expect(output).toEqual(expected);
      expect(figlet.loadedFonts()).toStrictEqual(['Standard']);
    });

    it('text should execute without error for valid inputs and pass its return data to its callback', async () => {

      const localPath = import.meta.url;
      const lastSlashIndex = localPath.lastIndexOf("/");
      const directoryPath = localPath.substring(0, lastSlashIndex);
      const mockCallback = vi.fn();

      const mockResponse = {
        ok: true,
        statusText: 'OK',
        text: () => Promise.resolve(fontData),
      };
      // @ts-ignore
      fetchSpy.mockReturnValue(Promise.resolve(mockResponse));

      figlet.defaults({
        fontPath: `${directoryPath}/../fonts`,
      });

      expect(figlet.loadedFonts()).toStrictEqual([]);

      figlet.text(text, 'Standard', mockCallback);

      await new Promise(resolve => setTimeout(resolve, 100)); // give time for the callback to execute

      expect(mockCallback).toHaveBeenCalledWith(null, expected);
      expect(figlet.loadedFonts()).toStrictEqual(['Standard']);

    });

    it('text should allow empty lines in output', async () => {

      const localPath = import.meta.url;
      const lastSlashIndex = localPath.lastIndexOf("/");
      const directoryPath = localPath.substring(0, lastSlashIndex);

      const expected = readExpected('miniwi_multiline');
      const multilineText = 'This\n\nis\n\n\na test'

      const mockResponse = {
        ok: true,
        statusText: 'OK',
        text: () => Promise.resolve(miniwi),
      };
      // @ts-ignore
      fetchSpy.mockReturnValue(Promise.resolve(mockResponse));

      figlet.defaults({
        fontPath: `${directoryPath}/../fonts`,
      });

      expect(figlet.loadedFonts()).toStrictEqual([]);

      const output = await figlet.text(multilineText, 'miniwi');

      expect(output).toEqual(expected);
      expect(figlet.loadedFonts()).toStrictEqual(['miniwi']);
    });
  });
});
