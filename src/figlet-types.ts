// Type definitions inspired by @types/figlet
export type FontName =
  | "1Row"
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
  | string; // Allow custom fonts

export type KerningMethods =
  | "default"
  | "full"
  | "fitted"
  | "controlled smushing"
  | "universal smushing";

export type PrintDirection = -1 | 0 | 1;

export interface FittingRules {
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

export type FittingProperties =
  | "hLayout"
  | "hRule1"
  | "hRule2"
  | "hRule3"
  | "hRule4"
  | "hRule5"
  | "hRule6"
  | "vLayout"
  | "vRule1"
  | "vRule2"
  | "vRule3"
  | "vRule4"
  | "vRule5";

export interface FontMetadata {
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

export interface FigletOptions {
  font?: FontName;
  horizontalLayout?: KerningMethods;
  verticalLayout?: KerningMethods;
  width?: number;
  whitespaceBreak?: boolean;
  printDirection?: PrintDirection;
  showHardBlanks?: boolean;
}

export interface FigletDefaults {
  font: FontName;
  fontPath: string;
}

export type CallbackFunction<T = string> = (
  error: Error | null,
  result?: T,
) => void;

export const LAYOUT = {
  FULL_WIDTH: 0,
  FITTING: 1,
  SMUSHING: 2,
  CONTROLLED_SMUSHING: 3,
} as const;

export type LayoutType = (typeof LAYOUT)[keyof typeof LAYOUT];

export interface FigChar {
  [charCode: number]: string;
}

export class FigletFont {
  public options: FontMetadata;
  public comment: string = "";
  public numChars: number = 0;

  [charCode: number]: string[];

  constructor() {
    this.options = {} as FontMetadata;
  }
}

export interface InternalOptions extends FontMetadata {
  width: number;
  whitespaceBreak: boolean;
  showHardBlanks: boolean;
}

export interface FigCharWithOverlap {
  fig: string[];
  overlap?: number;
}

export interface FigCharsWithOverlap {
  chars: FigCharWithOverlap[];
  overlap?: number;
}

export interface BreakWordResult {
  outputFigText: string[];
  chars: FigCharWithOverlap[];
}

export interface FigletModule {
  loadFont: (
    font: FontName,
    callback?: CallbackFunction<FontMetadata>,
  ) => Promise<FontMetadata>;
  loadFontSync: (font: FontName) => FontMetadata;
  fonts: (callback?: CallbackFunction<FontName[]>) => Promise<FontName[]>;
  fontsSync: () => FontName[];
  parseFont: (font: FontName, data: string) => FontMetadata;
  textSync: (text: string, options?: FigletOptions) => string;
  text: (
    text: string,
    optionsOrFontOrCallback?:
      | FigletOptions
      | FontName
      | CallbackFunction<string>,
    callback?: CallbackFunction<string>,
  ) => Promise<string>;
  figFonts: Record<string, FigletFont>;
  defaults: (opts?: Partial<FigletDefaults>) => FigletDefaults;
  metadata: (
    fontName: FontName,
    callback?: (
      error: Error | null,
      fontOptions?: FontMetadata,
      comment?: string,
    ) => void,
  ) => Promise<[FontMetadata, string]>;
}
