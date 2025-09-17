declare type CallbackFunction<T = string> = (error: Error | null, result?: T) => void;

declare interface FigletDefaults {
  font: FontName;
  fontPath: string;
  fetchFontIfMissing: boolean;
}

declare class FigletFont {
  options: FontMetadata;
  comment: string;
  numChars: number;

  [charCode: number]: string[];

  constructor();
}

declare interface FigletModule {
  loadFont: (font: FontName, callback?: CallbackFunction<FontMetadata>) => Promise<FontMetadata | null>;
  loadFontSync: (font: FontName) => FontMetadata;
  fonts: (callback?: CallbackFunction<FontName[]>) => Promise<FontName[]>;
  fontsSync: () => FontName[];
  parseFont: (font: FontName, data: string, override?: boolean) => FontMetadata;
  preloadFonts: (fonts: FontName[], callback?: (error?: Error) => void) => Promise<void>;
  loadedFonts: () => string[];
  clearLoadedFonts: () => void;
  textSync: (text: string, options?: FigletOptions) => string;
  text: (text: string, optionsOrFontOrCallback?: FigletOptions | FontName | CallbackFunction<string>, callback?: CallbackFunction<string>) => Promise<string>;

  (text: string, optionsOrFontOrCallback?: FigletOptions | FontName | CallbackFunction<string>, callback?: CallbackFunction<string>): Promise<string>;

  figFonts: Record<string, FigletFont>;
  defaults: (opts?: Partial<FigletDefaults>) => FigletDefaults;
  metadata: (fontName: FontName, callback?: (error: Error | null, fontOptions?: FontMetadata, comment?: string) => void) => Promise<[FontMetadata, string] | null>;
}

declare interface FigletOptions {
  font?: FontName;
  horizontalLayout?: KerningMethods;
  verticalLayout?: KerningMethods;
  width?: number;
  whitespaceBreak?: boolean;
  printDirection?: PrintDirection;
  showHardBlanks?: boolean;
}

declare interface FittingRules {
  hLayout: number;
  hRule1: boolean;
  hRule2: boolean;
  hRule3: boolean;
  hRule4: boolean;
  hRule5: boolean;
  hRule6: boolean;
  vLayout: number;
  vRule1: boolean;
  vRule2: boolean;
  vRule3: boolean;
  vRule4: boolean;
  vRule5: boolean;
}

declare interface FontMetadata {
  baseline?: number;
  codeTagCount?: number | null;
  fittingRules: FittingRules;
  fullLayout?: number | null;
  hardBlank?: string;
  height?: number;
  maxLength?: number;
  numCommentLines?: number;
  oldLayout?: number;
  printDirection?: PrintDirection;
}

declare type FontName =
  "1Row"
  | "3-D"
  | "3D Diagonal"
  | "3D-ASCII"
  | "3x5"
  | "4Max"
  | "5 Line Oblique"
  | "Standard"
  | "Ghost"
  | "Big"
  | "Block"
  | "Bubble"
  | "Digital"
  | "Ivrit"
  | "Mini"
  | "Script"
  | "Shadow"
  | "Slant"
  | "Small"
  | "Speed"
  | "Tinker-Toy"
  | string;

declare type KerningMethods = "default" | "full" | "fitted" | "controlled smushing" | "universal smushing";

declare type PrintDirection = -1 | 0 | 1;

declare const nodeFiglet: FigletModule;

declare namespace nodeFiglet {
  export type {
    CallbackFunction,
    FigletDefaults,
    FigletOptions,
    FontMetadata,
    FontName,
    KerningMethods,
    PrintDirection
  };
}

export = nodeFiglet;
