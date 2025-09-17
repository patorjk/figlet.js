/*
    FIGlet.ts (a FIGDriver for FIGlet fonts)
    Written by https://github.com/patorjk/figlet.js/graphs/contributors
    Originally Written For: http://patorjk.com/software/taag/
    License: MIT

    This TypeScript code aims to fully implement the FIGlet spec.
    Full FIGlet spec: http://patorjk.com/software/taag/docs/figfont.txt

    FIGlet fonts are actually kind of complex, which is why you will see
    a lot of code about parsing and interpreting rules. The actual generation
    code is pretty simple and is done near the bottom of the code.
*/
import {
  BreakWordResult,
  CallbackFunction,
  FigletDefaults,
  FigCharsWithOverlap,
  FigCharWithOverlap,
  FigletModule,
  FigletFont,
  FittingRules,
  FontName,
  FontMetadata,
  InternalOptions,
  KerningMethods,
  LAYOUT,
  LayoutType,
  FigletOptions,
  PrintDirection,
} from "./figlet-types";
import { fontList } from "./font-list";

// helper method
function escapeRegExpChar(char: string): string {
  // Characters that have special meaning in regex and need escaping
  const specialChars = /[.*+?^${}()|[\]\\]/;
  return specialChars.test(char) ? "\\" + char : char;
}

const figlet: FigletModule = (() => {
  // ---------------------------------------------------------------------
  // Private static variables

  const { FULL_WIDTH = 0, FITTING, SMUSHING, CONTROLLED_SMUSHING } = LAYOUT;

  // ---------------------------------------------------------------------
  // Variable that will hold information about the fonts

  const figFonts: Record<string, FigletFont> = {}; // What stores all of the FIGlet font data
  const figDefaults: FigletDefaults = {
    font: "Standard",
    fontPath: "./fonts",
    fetchFontIfMissing: true,
  };

  // ---------------------------------------------------------------------
  // Private static methods

  /**
   * Figures out the end char for a FIGlet line and removes it. Technically there aren't supposed to be white spaces
   * after the end char, but certain TOIlet fonts have this. The FIGlet unix app handles this though so we handle it
   * here too.
   *
   * @param line
   * @param lineNum
   * @param fontHeight
   */
  function removeEndChar(line: string, lineNum: number, fontHeight: number) {
    const endChar = escapeRegExpChar(line.trim().slice(-1)) || "@";
    const endCharRegEx =
      lineNum === fontHeight - 1
        ? new RegExp(endChar + endChar + "?\\s*$")
        : new RegExp(endChar + "\\s*$");
    return line.replace(endCharRegEx, "");
  }

  /**
   *  This method takes in the oldLayout and newLayout data from the FIGfont header file and returns
   *  the layout information.
   *
   */
  function getSmushingRules(
    oldLayout: number = -1,
    newLayout: number | null = null,
  ) {
    let rules: Partial<FittingRules> = {};
    let val;
    let codes: Array<[number, keyof FittingRules, boolean | LayoutType]> = [
      [16384, "vLayout", SMUSHING],
      [8192, "vLayout", FITTING],
      [4096, "vRule5", true],
      [2048, "vRule4", true],
      [1024, "vRule3", true],
      [512, "vRule2", true],
      [256, "vRule1", true],
      [128, "hLayout", SMUSHING],
      [64, "hLayout", FITTING],
      [32, "hRule6", true],
      [16, "hRule5", true],
      [8, "hRule4", true],
      [4, "hRule3", true],
      [2, "hRule2", true],
      [1, "hRule1", true],
    ];

    val = newLayout !== null ? newLayout : oldLayout;

    for (const [code, rule, value] of codes) {
      if (val >= code) {
        val -= code;
        if (rules[rule] === undefined) {
          rules[rule] = value as any;
        }
      } else if (rule !== "vLayout" && rule !== "hLayout") {
        rules[rule] = false as any;
      }
    }

    if (typeof rules["hLayout"] === "undefined") {
      if (oldLayout === 0) {
        rules["hLayout"] = FITTING;
      } else if (oldLayout === -1) {
        rules["hLayout"] = FULL_WIDTH;
      } else {
        if (
          rules["hRule1"] ||
          rules["hRule2"] ||
          rules["hRule3"] ||
          rules["hRule4"] ||
          rules["hRule5"] ||
          rules["hRule6"]
        ) {
          rules["hLayout"] = CONTROLLED_SMUSHING;
        } else {
          rules["hLayout"] = SMUSHING;
        }
      }
    } else if (rules["hLayout"] === SMUSHING) {
      if (
        rules["hRule1"] ||
        rules["hRule2"] ||
        rules["hRule3"] ||
        rules["hRule4"] ||
        rules["hRule5"] ||
        rules["hRule6"]
      ) {
        rules["hLayout"] = CONTROLLED_SMUSHING;
      }
    }

    if (typeof rules["vLayout"] === "undefined") {
      if (
        rules["vRule1"] ||
        rules["vRule2"] ||
        rules["vRule3"] ||
        rules["vRule4"] ||
        rules["vRule5"]
      ) {
        rules["vLayout"] = CONTROLLED_SMUSHING;
      } else {
        rules["vLayout"] = FULL_WIDTH;
      }
    } else if (rules["vLayout"] === SMUSHING) {
      if (
        rules["vRule1"] ||
        rules["vRule2"] ||
        rules["vRule3"] ||
        rules["vRule4"] ||
        rules["vRule5"]
      ) {
        rules["vLayout"] = CONTROLLED_SMUSHING;
      }
    }

    return rules as FittingRules;
  }

  /* The [vh]Rule[1-6]_Smush functions return the smushed character OR false if the two characters can't be smushed */

  /**
   *  Rule 1: EQUAL CHARACTER SMUSHING (code value 1)
   *
   *    Two sub-characters are smushed into a single sub-character
   *    if they are the same.  This rule does not smush
   *    hardblanks.  (See rule 6 on hardblanks below)
   */
  function hRule1_Smush(
    ch1: string,
    ch2: string,
    hardBlank: string = "",
  ): string | false {
    if (ch1 === ch2 && ch1 !== hardBlank) {
      return ch1;
    }
    return false;
  }

  /**
   *  Rule 2: UNDERSCORE SMUSHING (code value 2)
   *
   *    An underscore ("_") will be replaced by any of: "|", "/",
   *    "\", "[", "]", "{", "}", "(", ")", "<" or ">".
   */
  function hRule2_Smush(ch1: string, ch2: string): string | false {
    let rule2Str = "|/\\[]{}()<>";
    if (ch1 === "_") {
      if (rule2Str.indexOf(ch2) !== -1) {
        return ch2;
      }
    } else if (ch2 === "_") {
      if (rule2Str.indexOf(ch1) !== -1) {
        return ch1;
      }
    }
    return false;
  }

  /**
   *  Rule 3: HIERARCHY SMUSHING (code value 4)
   *
   *    A hierarchy of six classes is used: "|", "/\", "[]", "{}",
   *    "()", and "<>".  When two smushing sub-characters are
   *    from different classes, the one from the latter class
   *    will be used.
   */
  function hRule3_Smush(ch1: string, ch2: string): string | false {
    let rule3Classes = "| /\\ [] {} () <>";
    let r3_pos1 = rule3Classes.indexOf(ch1);
    let r3_pos2 = rule3Classes.indexOf(ch2);
    if (r3_pos1 !== -1 && r3_pos2 !== -1) {
      if (r3_pos1 !== r3_pos2 && Math.abs(r3_pos1 - r3_pos2) !== 1) {
        const startPos = Math.max(r3_pos1, r3_pos2);
        const endPos = startPos + 1;
        return rule3Classes.substring(startPos, endPos);
      }
    }
    return false;
  }

  /**
   *  Rule 4: OPPOSITE PAIR SMUSHING (code value 8)
   *
   *    Smushes opposing brackets ("[]" or "]["), braces ("{}" or
   *    "}{") and parentheses ("()" or ")(") together, replacing
   *    any such pair with a vertical bar ("|").
   */
  function hRule4_Smush(ch1: string, ch2: string): string | false {
    let rule4Str = "[] {} ()";
    let r4_pos1 = rule4Str.indexOf(ch1);
    let r4_pos2 = rule4Str.indexOf(ch2);
    if (r4_pos1 !== -1 && r4_pos2 !== -1) {
      if (Math.abs(r4_pos1 - r4_pos2) <= 1) {
        return "|";
      }
    }
    return false;
  }

  /**
   *  Rule 5: BIG X SMUSHING (code value 16)
   *
   *    Smushes "/\" into "|", "\/" into "Y", and "><" into "X".
   *    Note that "<>" is not smushed in any way by this rule.
   *    The name "BIG X" is historical; originally all three pairs
   *    were smushed into "X".
   */
  function hRule5_Smush(ch1: string, ch2: string): string | false {
    const patterns: Record<string, string> = {
      "/\\": "|",
      "\\/": "Y",
      "><": "X",
    };
    return patterns[ch1 + ch2] || false;
  }

  /**
   *  Rule 6: HARDBLANK SMUSHING (code value 32)
   *
   *    Smushes two hardblanks together, replacing them with a
   *    single hardblank.  (See "Hardblanks" below.)
   */
  function hRule6_Smush(
    ch1: string,
    ch2: string,
    hardBlank: string = "",
  ): string | false {
    if (ch1 === hardBlank && ch2 === hardBlank) {
      return hardBlank;
    }
    return false;
  }

  /**
   *  Rule 1: EQUAL CHARACTER SMUSHING (code value 256)
   *
   *    Same as horizontal smushing rule 1.
   */
  function vRule1_Smush(ch1: string, ch2: string): string | false {
    if (ch1 === ch2) {
      return ch1;
    }
    return false;
  }

  /**
   *  Rule 2: UNDERSCORE SMUSHING (code value 512)
   *
   *    Same as horizontal smushing rule 2.
   */
  function vRule2_Smush(ch1: string, ch2: string): string | false {
    return hRule2_Smush(ch1, ch2);
  }

  /**
   *  Rule 3: HIERARCHY SMUSHING (code value 1024)
   *
   *    Same as horizontal smushing rule 3.
   */
  function vRule3_Smush(ch1: string, ch2: string): string | false {
    return hRule3_Smush(ch1, ch2);
  }

  /**
   *  Rule 4: HORIZONTAL LINE SMUSHING (code value 2048)
   *
   *    Smushes stacked pairs of "-" and "_", replacing them with
   *    a single "=" sub-character.  It does not matter which is
   *    found above the other.  Note that vertical smushing rule 1
   *    will smush IDENTICAL pairs of horizontal lines, while this
   *    rule smushes horizontal lines consisting of DIFFERENT
   *    sub-characters.
   */
  function vRule4_Smush(ch1: string, ch2: string): string | false {
    if ((ch1 === "-" && ch2 === "_") || (ch1 === "_" && ch2 === "-")) {
      return "=";
    }
    return false;
  }

  /**
   *  Rule 5: VERTICAL LINE SUPERSMUSHING (code value 4096)
   *
   *    This one rule is different from all others, in that it
   *    "supersmushes" vertical lines consisting of several
   *    vertical bars ("|").  This creates the illusion that
   *    FIGcharacters have slid vertically against each other.
   *    Supersmushing continues until any sub-characters other
   *    than "|" would have to be smushed.  Supersmushing can
   *    produce impressive results, but it is seldom possible,
   *    since other sub-characters would usually have to be
   *    considered for smushing as soon as any such stacked
   *    vertical lines are encountered.
   */
  function vRule5_Smush(ch1: string, ch2: string): string | false {
    if (ch1 === "|" && ch2 === "|") {
      return "|";
    }
    return false;
  }

  /**
   *    Universal smushing simply overrides the sub-character from the
   *    earlier FIGcharacter with the sub-character from the later
   *    FIGcharacter.  This produces an "overlapping" effect with some
   *    FIGfonts, wherin the latter FIGcharacter may appear to be "in
   *    front".
   */
  function uni_Smush(ch1: string, ch2: string, hardBlank?: string): string {
    if (ch2 === " " || ch2 === "") {
      return ch1;
    } else if (ch2 === hardBlank && ch1 !== " ") {
      return ch1;
    } else {
      return ch2;
    }
  }

  // --------------------------------------------------------------------------
  // main vertical smush routines (excluding rules)

  /**
   * This function takes in two lines of text and returns one of the following:
   * "valid" - These liens can be smushed together given the current smushing rules.
   * "end" - The lines can be smushed, but we're at a stopping point.
   * "invalid" - The two liens cannot be smushed together.
   *
   * @param txt1 Line of text from a character
   * @param txt2 Line of text from a character
   * @param opts FIGlet options array
   */
  function canVerticalSmush(
    txt1: string,
    txt2: string,
    opts: InternalOptions,
  ): "valid" | "end" | "invalid" {
    if (opts.fittingRules?.vLayout === FULL_WIDTH) {
      return "invalid";
    }
    let ii,
      len = Math.min(txt1.length, txt2.length),
      ch1,
      ch2,
      endSmush = false,
      validSmush;
    if (len === 0) {
      return "invalid";
    }

    for (ii = 0; ii < len; ii++) {
      ch1 = txt1.substring(ii, ii + 1);
      ch2 = txt2.substring(ii, ii + 1);
      if (ch1 !== " " && ch2 !== " ") {
        if (opts.fittingRules?.vLayout === FITTING) {
          return "invalid";
        } else if (opts.fittingRules?.vLayout === SMUSHING) {
          return "end";
        } else {
          if (vRule5_Smush(ch1, ch2)) {
            endSmush = endSmush || false;
            continue;
          } // rule 5 allow for "super" smushing, but only if we're not already ending this smush
          validSmush = false;
          validSmush = opts.fittingRules?.vRule1
            ? vRule1_Smush(ch1, ch2)
            : validSmush;
          validSmush =
            !validSmush && opts.fittingRules?.vRule2
              ? vRule2_Smush(ch1, ch2)
              : validSmush;
          validSmush =
            !validSmush && opts.fittingRules?.vRule3
              ? vRule3_Smush(ch1, ch2)
              : validSmush;
          validSmush =
            !validSmush && opts.fittingRules?.vRule4
              ? vRule4_Smush(ch1, ch2)
              : validSmush;
          endSmush = true;
          if (!validSmush) {
            return "invalid";
          }
        }
      }
    }
    if (endSmush) {
      return "end";
    } else {
      return "valid";
    }
  }

  function getVerticalSmushDist(
    lines1: string[],
    lines2: string[],
    opts: InternalOptions,
  ): number {
    let maxDist = lines1.length;
    let len1 = lines1.length;
    let subLines1, subLines2, slen;
    let curDist = 1;
    let ii, ret, result;
    while (curDist <= maxDist) {
      subLines1 = lines1.slice(Math.max(0, len1 - curDist), len1);
      subLines2 = lines2.slice(0, Math.min(maxDist, curDist));

      slen = subLines2.length;
      result = "";
      for (ii = 0; ii < slen; ii++) {
        ret = canVerticalSmush(subLines1[ii], subLines2[ii], opts);
        if (ret === "end") {
          result = ret;
        } else if (ret === "invalid") {
          result = ret;
          break;
        } else {
          if (result === "") {
            result = "valid";
          }
        }
      }

      if (result === "invalid") {
        curDist--;
        break;
      }
      if (result === "end") {
        break;
      }
      if (result === "valid") {
        curDist++;
      }
    }

    return Math.min(maxDist, curDist);
  }

  function verticallySmushLines(
    line1: string,
    line2: string,
    opts: InternalOptions,
  ): string {
    let ii,
      len = Math.min(line1.length, line2.length);
    let ch1,
      ch2,
      result = "",
      validSmush;

    for (ii = 0; ii < len; ii++) {
      ch1 = line1.substring(ii, ii + 1);
      ch2 = line2.substring(ii, ii + 1);
      if (ch1 !== " " && ch2 !== " ") {
        if (opts.fittingRules?.vLayout === FITTING) {
          result += uni_Smush(ch1, ch2);
        } else if (opts.fittingRules?.vLayout === SMUSHING) {
          result += uni_Smush(ch1, ch2);
        } else {
          validSmush = false;
          validSmush = opts.fittingRules?.vRule5
            ? vRule5_Smush(ch1, ch2)
            : validSmush;
          validSmush =
            !validSmush && opts.fittingRules?.vRule1
              ? vRule1_Smush(ch1, ch2)
              : validSmush;
          validSmush =
            !validSmush && opts.fittingRules?.vRule2
              ? vRule2_Smush(ch1, ch2)
              : validSmush;
          validSmush =
            !validSmush && opts.fittingRules?.vRule3
              ? vRule3_Smush(ch1, ch2)
              : validSmush;
          validSmush =
            !validSmush && opts.fittingRules?.vRule4
              ? vRule4_Smush(ch1, ch2)
              : validSmush;
          result += validSmush;
        }
      } else {
        result += uni_Smush(ch1, ch2);
      }
    }
    return result;
  }

  function verticalSmush(
    lines1: string[],
    lines2: string[],
    overlap: number,
    opts: InternalOptions,
  ): string[] {
    let len1 = lines1.length;
    let len2 = lines2.length;
    let piece1 = lines1.slice(0, Math.max(0, len1 - overlap));
    let piece2_1 = lines1.slice(Math.max(0, len1 - overlap), len1);
    let piece2_2 = lines2.slice(0, Math.min(overlap, len2));
    let ii,
      len,
      line,
      piece2 = [],
      piece3;

    len = piece2_1.length;
    for (ii = 0; ii < len; ii++) {
      if (ii >= len2) {
        line = piece2_1[ii];
      } else {
        line = verticallySmushLines(piece2_1[ii], piece2_2[ii], opts);
      }
      piece2.push(line);
    }

    piece3 = lines2.slice(Math.min(overlap, len2), len2);

    return [...piece1, ...piece2, ...piece3];
  }

  function padLines(lines: string[], numSpaces: number): string[] {
    const padding = " ".repeat(numSpaces);
    return lines.map((line) => line + padding);
  }

  function smushVerticalFigLines(
    output: string[],
    lines: string[],
    opts: InternalOptions,
  ): string[] {
    let len1 = output[0].length;
    let len2 = lines[0].length;
    let overlap;
    if (len1 > len2) {
      lines = padLines(lines, len1 - len2);
    } else if (len2 > len1) {
      output = padLines(output, len2 - len1);
    }
    overlap = getVerticalSmushDist(output, lines, opts);
    return verticalSmush(output, lines, overlap, opts);
  }

  // -------------------------------------------------------------------------
  // Main horizontal smush routines (excluding rules)

  function getHorizontalSmushLength(
    txt1: string,
    txt2: string,
    opts: InternalOptions,
  ): number {
    if (opts.fittingRules?.hLayout === FULL_WIDTH) {
      return 0;
    }
    let ii,
      len1 = txt1.length,
      len2 = txt2.length;
    let maxDist = len1;
    let curDist = 1;
    let breakAfter = false;
    let seg1, seg2, ch1, ch2;
    if (len1 === 0) {
      return 0;
    }

    distCal: while (curDist <= maxDist) {
      const seg1StartPos = len1 - curDist;
      seg1 = txt1.substring(seg1StartPos, seg1StartPos + curDist);
      seg2 = txt2.substring(0, Math.min(curDist, len2));
      for (ii = 0; ii < Math.min(curDist, len2); ii++) {
        ch1 = seg1.substring(ii, ii + 1);
        ch2 = seg2.substring(ii, ii + 1);
        if (ch1 !== " " && ch2 !== " ") {
          if (opts.fittingRules?.hLayout === FITTING) {
            curDist = curDist - 1;
            break distCal;
          } else if (opts.fittingRules?.hLayout === SMUSHING) {
            if (ch1 === opts.hardBlank || ch2 === opts.hardBlank) {
              curDist = curDist - 1; // universal smushing does not smush hardblanks
            }
            break distCal;
          } else {
            breakAfter = true; // we know we need to break, but we need to check if our smushing rules will allow us to smush the overlapped characters

            // the below checks will let us know if we can smush these characters
            const validSmush =
              (opts.fittingRules?.hRule1 &&
                hRule1_Smush(ch1, ch2, opts?.hardBlank)) ||
              (opts.fittingRules?.hRule2 && hRule2_Smush(ch1, ch2)) ||
              (opts.fittingRules?.hRule3 && hRule3_Smush(ch1, ch2)) ||
              (opts.fittingRules?.hRule4 && hRule4_Smush(ch1, ch2)) ||
              (opts.fittingRules?.hRule5 && hRule5_Smush(ch1, ch2)) ||
              (opts.fittingRules?.hRule6 &&
                hRule6_Smush(ch1, ch2, opts?.hardBlank));

            if (!validSmush) {
              curDist = curDist - 1;
              break distCal;
            }
          }
        }
      }
      if (breakAfter) {
        break;
      }
      curDist++;
    }
    return Math.min(maxDist, curDist);
  }

  function horizontalSmush(
    textBlock1: string[],
    textBlock2: string[],
    overlap: number,
    opts: InternalOptions,
  ): string[] {
    let ii,
      jj,
      outputFig: string[] = [],
      overlapStart,
      piece1,
      piece2,
      piece3,
      len1,
      len2,
      txt1,
      txt2;

    if (typeof opts.height !== "number") {
      throw new Error("height is not defined.");
    }

    for (ii = 0; ii < opts.height; ii++) {
      txt1 = textBlock1[ii];
      txt2 = textBlock2[ii];
      len1 = txt1.length;
      len2 = txt2.length;
      overlapStart = len1 - overlap;
      piece1 = txt1.slice(0, Math.max(0, overlapStart));
      piece2 = "";

      // determine overlap piece
      const seg1StartPos = Math.max(0, len1 - overlap);
      let seg1 = txt1.substring(seg1StartPos, seg1StartPos + overlap);
      let seg2 = txt2.substring(0, Math.min(overlap, len2));

      for (jj = 0; jj < overlap; jj++) {
        let ch1 = jj < len1 ? seg1.substring(jj, jj + 1) : " ";
        let ch2 = jj < len2 ? seg2.substring(jj, jj + 1) : " ";

        if (ch1 !== " " && ch2 !== " ") {
          if (
            opts.fittingRules?.hLayout === FITTING ||
            opts.fittingRules?.hLayout === SMUSHING
          ) {
            piece2 += uni_Smush(ch1, ch2, opts.hardBlank);
          } else {
            // Controlled Smushing
            const nextCh =
              (opts.fittingRules?.hRule1 &&
                hRule1_Smush(ch1, ch2, opts.hardBlank)) ||
              (opts.fittingRules?.hRule2 && hRule2_Smush(ch1, ch2)) ||
              (opts.fittingRules?.hRule3 && hRule3_Smush(ch1, ch2)) ||
              (opts.fittingRules?.hRule4 && hRule4_Smush(ch1, ch2)) ||
              (opts.fittingRules?.hRule5 && hRule5_Smush(ch1, ch2)) ||
              (opts.fittingRules?.hRule6 &&
                hRule6_Smush(ch1, ch2, opts.hardBlank)) ||
              uni_Smush(ch1, ch2, opts.hardBlank);

            piece2 += nextCh;
          }
        } else {
          piece2 += uni_Smush(ch1, ch2, opts.hardBlank);
        }
      }

      if (overlap >= len2) {
        piece3 = "";
      } else {
        piece3 = txt2.substring(overlap, overlap + Math.max(0, len2 - overlap));
      }
      outputFig[ii] = piece1 + piece2 + piece3;
    }
    return outputFig;
  }

  /**
   * Creates new empty ASCII placeholder of given length
   *
   * @param len
   */
  function newFigChar(len: number): string[] {
    return new Array(len).fill("");
  }

  /**
   * Return max line of the ASCII Art
   *
   * @param textLines Lines for the text
   */
  const figLinesWidth = function (textLines: string[]): number {
    return Math.max(...textLines.map((line) => line.length));
  };

  /**
   * Join words or single characters into a single Fig line
   *
   * @param array Array of ASCII words or single character: {fig: array, overlap: number}
   * @param len Height of the characters (number of rows)
   * @param opts
   */
  function joinFigArray(
    array: FigCharWithOverlap[],
    len: number,
    opts: InternalOptions,
  ): string[] {
    return array.reduce(function (acc, data) {
      return horizontalSmush(acc, data.fig, data.overlap || 0, opts);
    }, newFigChar(len));
  }

  /**
   * Break long words, return leftover characters and line before the break
   *
   * @param figChars List of single ASCII characters in form {fig, overlap}
   * @param len
   * @param opts
   */
  function breakWord(
    figChars: FigCharWithOverlap[],
    len: number,
    opts: InternalOptions,
  ): BreakWordResult {
    for (let i = figChars.length - 1; i > 0; i--) {
      const w = joinFigArray(figChars.slice(0, i), len, opts);
      if (figLinesWidth(w) <= opts.width) {
        return {
          outputFigText: w,
          chars: figChars.slice(i),
        };
      }
    }
    return { outputFigText: newFigChar(len), chars: figChars };
  }

  function generateFigTextLines(
    txt: string,
    figChars: FigletFont,
    opts: InternalOptions,
  ): string[][] {
    let charIndex,
      figChar: string[],
      overlap = 0,
      row,
      outputFigText,
      len,
      height = opts.height,
      outputFigLines: string[][] = [],
      maxWidth,
      nextFigChars: FigCharsWithOverlap = {
        chars: [], // list of characters is used to break in the middle of the word when word is longer
        overlap, // chars is array of characters with {fig, overlap} and overlap is for whole word
      },
      figWords = [],
      char,
      isSpace,
      textFigWord,
      textFigLine,
      tmpBreak;

    if (typeof height !== "number") {
      throw new Error("height is not defined.");
    }

    outputFigText = newFigChar(height);

    if (opts.printDirection === 1) {
      txt = txt.split("").reverse().join("");
    }
    len = txt.length;
    for (charIndex = 0; charIndex < len; charIndex++) {
      char = txt.substring(charIndex, charIndex + 1);
      isSpace = char.match(/\s/);
      figChar = figChars[char.charCodeAt(0)];
      textFigLine = null;
      if (figChar) {
        if (opts.fittingRules?.hLayout !== FULL_WIDTH) {
          overlap = 10000; // a value too high to be the overlap
          for (row = 0; row < height; row++) {
            overlap = Math.min(
              overlap,
              getHorizontalSmushLength(outputFigText[row], figChar[row], opts),
            );
          }
          overlap = overlap === 10000 ? 0 : overlap;
        }
        if (opts.width > 0) {
          if (opts.whitespaceBreak) {
            // next character in last word (figChars have same data as words)
            textFigWord = joinFigArray(
              nextFigChars.chars.concat([
                {
                  fig: figChar,
                  overlap,
                },
              ]),
              height,
              opts,
            );
            textFigLine = joinFigArray(
              figWords.concat([
                {
                  fig: textFigWord,
                  overlap: nextFigChars.overlap,
                },
              ]),
              height,
              opts,
            );
            maxWidth = figLinesWidth(textFigLine);
          } else {
            textFigLine = horizontalSmush(
              outputFigText,
              figChar,
              overlap,
              opts,
            );
            maxWidth = figLinesWidth(textFigLine);
          }
          if (maxWidth >= opts.width && charIndex > 0) {
            if (opts.whitespaceBreak) {
              outputFigText = joinFigArray(figWords.slice(0, -1), height, opts);
              if (figWords.length > 1) {
                outputFigLines.push(outputFigText);
                outputFigText = newFigChar(height);
              }
              figWords = [];
            } else {
              outputFigLines.push(outputFigText);
              outputFigText = newFigChar(height);
            }
          }
        }
        if (opts.width > 0 && opts.whitespaceBreak) {
          if (!isSpace || charIndex === len - 1) {
            nextFigChars.chars.push({ fig: figChar, overlap });
          }
          if (isSpace || charIndex === len - 1) {
            // break long words
            tmpBreak = null;
            while (true) {
              textFigLine = joinFigArray(nextFigChars.chars, height, opts);
              maxWidth = figLinesWidth(textFigLine);
              if (maxWidth >= opts.width) {
                tmpBreak = breakWord(nextFigChars.chars, height, opts);
                nextFigChars = { chars: tmpBreak.chars }; // TODO: does overlap actually need to be apart of FigCharsWithOverlap type?
                outputFigLines.push(tmpBreak.outputFigText);
              } else {
                break;
              }
            }
            // any leftovers
            if (maxWidth > 0) {
              if (tmpBreak) {
                figWords.push({ fig: textFigLine, overlap: 1 });
              } else {
                figWords.push({
                  fig: textFigLine,
                  overlap: nextFigChars.overlap,
                });
              }
            }
            // save space character and current overlap for smush in joinFigWords
            if (isSpace) {
              figWords.push({ fig: figChar, overlap });
              outputFigText = newFigChar(height);
            }
            if (charIndex === len - 1) {
              // last line
              outputFigText = joinFigArray(figWords, height, opts);
            }
            nextFigChars = {
              chars: [],
              overlap: overlap,
            };
            continue;
          }
        }
        outputFigText = horizontalSmush(outputFigText, figChar, overlap, opts);
      }
    }
    // special case when last line would be empty
    // this may happen if text fit exactly opt.width
    if (figLinesWidth(outputFigText) > 0) {
      outputFigLines.push(outputFigText);
    }
    // remove hardblanks
    if (!opts.showHardBlanks) {
      outputFigLines.forEach(function (outputFigText) {
        len = outputFigText.length;
        for (row = 0; row < len; row++) {
          outputFigText[row] = outputFigText[row].replace(
            new RegExp("\\" + opts.hardBlank, "g"),
            " ",
          );
        }
      });
    }
    // special case where the line is just an empty line
    if (txt === "" && outputFigLines.length === 0) {
      outputFigLines.push(new Array(height).fill(""));
    }
    return outputFigLines;
  }

  // -------------------------------------------------------------------------
  // Parsing and Generation methods

  const getHorizontalFittingRules = function (
    layout: KerningMethods,
    options: FontMetadata,
  ): Partial<FittingRules> | undefined {
    let params: Partial<FittingRules>;
    if (layout === "default") {
      params = {
        hLayout: options.fittingRules?.hLayout,
        hRule1: options.fittingRules?.hRule1,
        hRule2: options.fittingRules?.hRule2,
        hRule3: options.fittingRules?.hRule3,
        hRule4: options.fittingRules?.hRule4,
        hRule5: options.fittingRules?.hRule5,
        hRule6: options.fittingRules?.hRule6,
      };
    } else if (layout === "full") {
      params = {
        hLayout: FULL_WIDTH,
        hRule1: false,
        hRule2: false,
        hRule3: false,
        hRule4: false,
        hRule5: false,
        hRule6: false,
      };
    } else if (layout === "fitted") {
      params = {
        hLayout: FITTING,
        hRule1: false,
        hRule2: false,
        hRule3: false,
        hRule4: false,
        hRule5: false,
        hRule6: false,
      };
    } else if (layout === "controlled smushing") {
      params = {
        hLayout: CONTROLLED_SMUSHING,
        hRule1: true,
        hRule2: true,
        hRule3: true,
        hRule4: true,
        hRule5: true,
        hRule6: true,
      };
    } else if (layout === "universal smushing") {
      params = {
        hLayout: SMUSHING,
        hRule1: false,
        hRule2: false,
        hRule3: false,
        hRule4: false,
        hRule5: false,
        hRule6: false,
      };
    } else {
      return;
    }
    return params;
  };

  const getVerticalFittingRules = function (
    layout: KerningMethods,
    options: FontMetadata,
  ): Partial<FittingRules> | undefined {
    let params: Partial<FittingRules> = {};
    if (layout === "default") {
      params = {
        vLayout: options.fittingRules?.vLayout,
        vRule1: options.fittingRules?.vRule1,
        vRule2: options.fittingRules?.vRule2,
        vRule3: options.fittingRules?.vRule3,
        vRule4: options.fittingRules?.vRule4,
        vRule5: options.fittingRules?.vRule5,
      };
    } else if (layout === "full") {
      params = {
        vLayout: FULL_WIDTH,
        vRule1: false,
        vRule2: false,
        vRule3: false,
        vRule4: false,
        vRule5: false,
      };
    } else if (layout === "fitted") {
      params = {
        vLayout: FITTING,
        vRule1: false,
        vRule2: false,
        vRule3: false,
        vRule4: false,
        vRule5: false,
      };
    } else if (layout === "controlled smushing") {
      params = {
        vLayout: CONTROLLED_SMUSHING,
        vRule1: true,
        vRule2: true,
        vRule3: true,
        vRule4: true,
        vRule5: true,
      };
    } else if (layout === "universal smushing") {
      params = {
        vLayout: SMUSHING,
        vRule1: false,
        vRule2: false,
        vRule3: false,
        vRule4: false,
        vRule5: false,
      };
    } else {
      return;
    }
    return params;
  };

  /**
   * Generates the ASCII Art
   *
   * @param fontName Font to use
   * @param options Options to override the defaults
   * @param txt The text to make into ASCII Art
   */
  const generateText = function (
    fontName: FontName,
    options: InternalOptions,
    txt: string,
  ): string {
    txt = txt.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    let lines = txt.split("\n");
    let figLines: string[][] = [];
    let ii, len, output;
    len = lines.length;
    for (ii = 0; ii < len; ii++) {
      figLines = figLines.concat(
        generateFigTextLines(lines[ii], figFonts[fontName], options),
      );
    }
    len = figLines.length;
    output = figLines[0];
    for (ii = 1; ii < len; ii++) {
      output = smushVerticalFigLines(output, figLines[ii], options);
    }

    return output ? output.join("\n") : "";
  };

  /*
    takes assigned options and merges them with the default options from the chosen font
   */
  function _reworkFontOpts(
    fontMeta: FontMetadata,
    options: FigletOptions,
  ): InternalOptions {
    let myOpts: InternalOptions;
    if (typeof structuredClone !== "undefined") {
      myOpts = structuredClone(fontMeta) as InternalOptions; // make a copy because we may edit this (see below)
    } else {
      myOpts = JSON.parse(JSON.stringify(fontMeta)) as InternalOptions; // make a copy because we may edit this (see below)
    }

    myOpts.showHardBlanks = options.showHardBlanks || false;
    myOpts.width = options.width || -1;
    myOpts.whitespaceBreak = options.whitespaceBreak || false;

    /*
     If the user is choosing to use a specific type of layout (e.g., 'full', 'fitted', etc etc)
     Then we need to override the default font options.
     */
    if (options.horizontalLayout) {
      const params = getHorizontalFittingRules(
        options.horizontalLayout,
        fontMeta,
      );
      if (params) {
        Object.assign(myOpts.fittingRules, params);
      }
    }

    if (options.verticalLayout) {
      const params = getVerticalFittingRules(options.verticalLayout, fontMeta);
      if (params) {
        Object.assign(myOpts.fittingRules, params);
      }
    }

    myOpts.printDirection = options.printDirection ?? fontMeta.printDirection;

    return myOpts;
  }

  // -------------------------------------------------------------------------
  // Public methods

  /**
   * A short-cut for the figlet.text method
   *
   * @param txt The text to make into ASCII Art.
   * @param optionsOrFontOrCallback Options that will override the current font's default options / a font name to use / the callback function
   * @param callback A callback function, it will contain the outputted ASCII Art.
   */
  const me = async function (
    txt: string,
    optionsOrFontOrCallback?:
      | FigletOptions
      | FontName
      | CallbackFunction<string>,
    callback?: CallbackFunction<string>,
  ): Promise<string> {
    return me.text(txt, optionsOrFontOrCallback, callback);
  };
  me.text = async function (
    txt: string,
    optionsOrFontOrCallback?:
      | FigletOptions
      | FontName
      | CallbackFunction<string>,
    callback?: CallbackFunction<string>,
  ): Promise<string> {
    txt = txt + ""; // ensure string
    let options: FigletOptions, next: CallbackFunction<string> | undefined;

    // Handle function overloading
    if (typeof optionsOrFontOrCallback === "function") {
      next = optionsOrFontOrCallback;
      options = { font: figDefaults.font };
    } else if (typeof optionsOrFontOrCallback === "string") {
      options = { font: optionsOrFontOrCallback };
      next = callback;
    } else if (optionsOrFontOrCallback) {
      options = optionsOrFontOrCallback;
      next = callback;
    } else {
      options = { font: figDefaults.font };
      next = callback;
    }
    const fontName = options.font || figDefaults.font;

    try {
      const fontOpts = await me.loadFont(fontName);
      const generatedTxt = fontOpts
        ? generateText(fontName, _reworkFontOpts(fontOpts, options), txt)
        : "";

      next?.(null, generatedTxt);
      return generatedTxt;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      if (next) {
        next(error);
        return "";
      }
      throw error;
    }
  };

  /**
   * Synchronous version of figlet.text
   * Accepts the same parameters (sans the callback).
   *
   * @param txt
   * @param options
   */
  me.textSync = function (
    txt: string,
    options?: FigletOptions | FontName,
  ): string {
    txt = txt + ""; // ensure string

    if (typeof options === "string") {
      options = { font: options };
    } else {
      options = options || {};
    }

    const fontName = options.font || figDefaults.font;
    let fontOpts = _reworkFontOpts(me.loadFontSync(fontName), options);

    return generateText(fontName, fontOpts, txt);
  };

  /**
   * Returns metadata about a specific FIGlet font.
   *
   * @param fontName
   * @param callback
   */
  me.metadata = async function (
    fontName: FontName,
    callback?: (
      error: Error | null,
      fontOptions?: FontMetadata,
      comment?: string,
    ) => void,
  ): Promise<[FontMetadata, string] | null> {
    fontName = fontName + "";

    try {
      const fontOpts = await me.loadFont(fontName);
      if (!fontOpts) {
        throw new Error("Error loading font.");
      }
      const font = figFonts[fontName];
      const result: [FontMetadata, string] = [fontOpts, font?.comment || ""];

      callback?.(null, fontOpts, font?.comment);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      if (callback) {
        callback(error);
        return null;
      }
      throw error;
    }
  };

  /**
   * Allows you to override the defaults. See the definition of the figDefaults object up above
   * to see what properties can be overridden.
   * Returns the options for the font.
   *
   * @param opts
   */
  me.defaults = function (opts?: Partial<FigletDefaults>) {
    if (opts && typeof opts === "object") {
      Object.assign(figDefaults, opts);
    }
    if (typeof structuredClone !== "undefined") {
      return structuredClone(figDefaults);
    } else {
      return JSON.parse(JSON.stringify(figDefaults));
    }
  };

  /**
   * Parses data from a FIGlet font file and places it into the figFonts object.
   *
   * @param fontName
   * @param data
   * @param override
   */
  me.parseFont = function (
    fontName: FontName,
    data: string,
    override: boolean = true,
  ): FontMetadata {
    if (figFonts[fontName] && !override) {
      return figFonts[fontName].options;
    }

    data = data.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    const font = new FigletFont();

    const lines = data.split("\n");
    const headerLine = lines.shift();
    if (!headerLine) {
      throw new Error("Invalid font file: missing header");
    }

    const headerData = headerLine.split(" ");

    const opts: FontMetadata = {
      hardBlank: headerData[0].substring(5, 6),
      height: parseInt(headerData[1], 10),
      baseline: parseInt(headerData[2], 10),
      maxLength: parseInt(headerData[3], 10),
      oldLayout: parseInt(headerData[4], 10),
      numCommentLines: parseInt(headerData[5], 10),
      printDirection: (headerData[6]
        ? parseInt(headerData[6], 10)
        : 0) as PrintDirection,
      fullLayout: headerData[7] ? parseInt(headerData[7], 10) : null,
      codeTagCount: headerData[8] ? parseInt(headerData[8], 10) : null,
    } as FontMetadata;

    // Validate header
    if (
      opts.hardBlank?.length !== 1 ||
      [
        opts.height,
        opts.baseline,
        opts.maxLength,
        opts.oldLayout,
        opts.numCommentLines,
      ].some((val) => val === null || val === undefined || isNaN(val))
    ) {
      throw new Error("FIGlet header contains invalid values.");
    }

    if (opts.height == null || opts.numCommentLines == null) {
      throw new Error("FIGlet header contains invalid values.");
    }

    opts.fittingRules = getSmushingRules(opts.oldLayout, opts.fullLayout);
    font.options = opts;

    // All FIGlet fonts must contain chars 32-126, 196, 214, 220, 228, 246, 252, 223
    const charNums: number[] = [];
    for (let i = 32; i <= 126; i++) {
      charNums.push(i);
    }
    charNums.push(196, 214, 220, 228, 246, 252, 223);

    // Validate sufficient data
    if (lines.length < opts.numCommentLines + opts.height * charNums.length) {
      throw new Error(
        `FIGlet file is missing data. Line length: ${lines.length}. Comment lines: ${opts.numCommentLines}. Height: ${opts.height}. Num chars: ${charNums.length}.`,
      );
    }

    // Parse comment
    font.comment = lines.splice(0, opts.numCommentLines).join("\n");
    font.numChars = 0;

    // Parse required characters
    while (lines.length > 0 && font.numChars < charNums.length) {
      const cNum = charNums[font.numChars];
      font[cNum] = lines.splice(0, opts.height);

      // Remove end sub-chars
      for (let i = 0; i < opts.height; i++) {
        if (typeof font[cNum][i] === "undefined") {
          font[cNum][i] = "";
        } else {
          font[cNum][i] = removeEndChar(font[cNum][i], i, opts.height);
        }
      }
      font.numChars++;
    }

    /*
        Now we check to see if any additional characters are present.
        Negative and positive char codes are allowed in hex, octal, or decimal.
    */
    // Parse additional characters
    while (lines.length > 0) {
      const cNumLine = lines.shift();
      if (!cNumLine || cNumLine.trim() === "") break;

      let cNum = cNumLine.split(" ")[0];

      // Parse hex, octal, or decimal
      let parsedNum: number;
      if (/^-?0[xX][0-9a-fA-F]+$/.test(cNum)) {
        parsedNum = parseInt(cNum, 16);
      } else if (/^-?0[0-7]+$/.test(cNum)) {
        parsedNum = parseInt(cNum, 8);
      } else if (/^-?[0-9]+$/.test(cNum)) {
        parsedNum = parseInt(cNum, 10);
      } else {
        throw new Error(`Error parsing data. Invalid data: ${cNum}`);
      }

      // Per Figlet specification, the character code can be in the range
      // of -2147483648 to +2147483647, but cannot be -1.
      if (
        parsedNum === -1 ||
        parsedNum < -2147483648 ||
        parsedNum > 2147483647
      ) {
        const msg =
          parsedNum === -1
            ? "The char code -1 is not permitted."
            : `The char code cannot be ${
                parsedNum < -2147483648
                  ? "less than -2147483648"
                  : "greater than 2147483647"
              }.`;
        throw new Error(`Error parsing data. ${msg}`);
      }

      font[parsedNum] = lines.splice(0, opts.height);

      // Remove end sub-chars
      for (let i = 0; i < opts.height; i++) {
        if (typeof font[parsedNum][i] === "undefined") {
          font[parsedNum][i] = "";
        } else {
          font[parsedNum][i] = removeEndChar(
            font[parsedNum][i],
            i,
            opts.height,
          );
        }
      }
      font.numChars++;
    }

    figFonts[fontName] = font;
    return opts;
  };

  /**
   * Returns an array of the fonts that have been parsed and loaded
   */
  me.loadedFonts = (): string[] => {
    return Object.keys(figFonts);
  };

  /**
   * Remove all fonts that have been loaded
   */
  me.clearLoadedFonts = (): void => {
    Object.keys(figFonts).forEach((key) => {
      delete figFonts[key];
    });
  };

  /**
   * Loads a font.
   *
   * @param fontName
   * @param callback
   */
  me.loadFont = async function (
    fontName: FontName,
    callback?: CallbackFunction<FontMetadata>,
  ): Promise<FontMetadata | null> {
    if (figFonts[fontName]) {
      const result = figFonts[fontName].options;
      callback?.(null, result);
      return Promise.resolve(result);
    }

    try {
      if (!figDefaults.fetchFontIfMissing) {
        throw new Error(`Font is not loaded: ${fontName}`);
      }

      const response = await fetch(`${figDefaults.fontPath}/${fontName}.flf`);

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }

      const text = await response.text();
      const result = me.parseFont(fontName, text);

      callback?.(null, result);
      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      if (callback) {
        callback(err);
        return null;
      }
      throw err;
    }
  };

  /**
   * Loads a font synchronously
   *
   * @param name
   */
  me.loadFontSync = function (name: FontName): FontMetadata {
    if (figFonts[name]) {
      return figFonts[name].options;
    }
    throw new Error(
      "Synchronous font loading is not implemented for the browser, it will only work for fonts already loaded.",
    );
  };

  /**
   * Preloads a list of fonts prior to using textSync
   *
   * @param fonts An array of font names (ex: ["Standard", "Soft"])
   * @param callback Callback
   */
  me.preloadFonts = async function (
    fonts: FontName[],
    callback?: (error?: Error) => void,
  ): Promise<void> {
    try {
      // Load fonts sequentially
      for (const name of fonts) {
        const response = await fetch(`${figDefaults.fontPath}/${name}.flf`);
        if (!response.ok) {
          throw new Error(
            `Failed to preload fonts. Error fetching font: ${name}, status code: ${response.statusText}`,
          );
        }

        const data = await response.text();
        me.parseFont(name, data);
      }

      callback?.();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      if (callback) {
        callback(err);
        return;
      }

      throw error; // Re-throw to allow caller to handle
    }
  };

  /**
   * Retrieves a list of the fonts.
   *
   * @param callback
   */
  me.fonts = function (
    callback?: CallbackFunction<string[]>,
  ): Promise<FontName[]> {
    return new Promise(function (resolve, reject) {
      resolve(fontList);
      callback?.(null, fontList);
    });
  };

  /**
   * Retrieves a list of the fonts.
   */
  me.fontsSync = function () {
    return fontList;
  };

  me.figFonts = figFonts;

  return me;
})();

export type {
  FigletOptions,
  FontMetadata,
  FontName,
  CallbackFunction,
  FigletDefaults,
};

export default figlet;
