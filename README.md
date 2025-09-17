```
___________.___  ________.__          __          __             /\   __          
\_   _____/|   |/  _____/|  |   _____/  |_       |__| ______    / / _/  |_  ______
 |    __)  |   /   \  ___|  | _/ __ \   __\      |  |/  ___/   / /  \   __\/  ___/
 |     \   |   \    \_\  \  |_\  ___/|  |        |  |\___ \   / /    |  |  \___ \ 
 \___  /   |___|\______  /____/\___  >__| /\ /\__|  /____  > / /     |__| /____  >
     \/                \/          \/     \/ \______|    \/  \/                \/ 
```

[![NPM Downloads](https://img.shields.io/npm/dt/figlet.svg?style=flat)](https://npmcharts.com/compare/figlet?minimal=true)

This project aims to fully implement the FIGfont spec in TypeScript (compiles to JavaScript). It works in the browser and with Node. You can see it in action here: http://patorjk.com/software/taag/ (this project was written to power that application)

## Quick Start - Node

Install:

```sh
npm install figlet
```

Simple usage:

```js
import figlet from "figlet";

async function doStuff() {
  const text = await figlet.text("Hello World!!");
  console.log(text);
}

doStuff();
```

Or the classic callback version:

```js
const figlet = require('figlet');

figlet("Hello World!!", function (err, data) {
  if (err) {
    console.log("Something went wrong...");
    console.dir(err);
    return;
  }
  console.log(data);
});
```

These will print out:

```
  _   _      _ _        __        __         _     _ _ _
 | | | | ___| | | ___   \ \      / /__  _ __| | __| | | |
 | |_| |/ _ \ | |/ _ \   \ \ /\ / / _ \| '__| |/ _` | | |
 |  _  |  __/ | | (_) |   \ V  V / (_) | |  | | (_| |_|_|
 |_| |_|\___|_|_|\___/     \_/\_/ \___/|_|  |_|\__,_(_|_)
```

## Basic Usage - Node

### text

Calling the figlet object as a function is shorthand for calling the text function. This method allows you to create ASCII Art from text. It takes in 3 parameters:

- Input Text - A string of text to turn into ASCII Art.
- Options - Either a string indicating the font name or an options object (description below).
- Callback - Optional function to execute with the generated ASCII Art.

The return value is a **promise** that resolves to the generated ASCII Art.

Example:

```js
figlet.text(
  "Boo!",
  {
    font: "Ghost",
    horizontalLayout: "default",
    verticalLayout: "default",
    width: 80,
    whitespaceBreak: true,
  },
  function (err, data) {
    if (err) {
      console.log("Something went wrong...");
      console.dir(err);
      return;
    }
    console.log(data);
  }
);
```

That will print out:

```
.-. .-')                            ,---.
\  ( OO )                           |   |
 ;-----.\  .-'),-----.  .-'),-----. |   |
 | .-.  | ( OO'  .-.  '( OO'  .-.  '|   |
 | '-' /_)/   |  | |  |/   |  | |  ||   |
 | .-. `. \_) |  |\|  |\_) |  |\|  ||  .'
 | |  \  |  \ |  | |  |  \ |  | |  |`--'
 | '--'  /   `'  '-'  '   `'  '-'  '.--.
 `------'      `-----'      `-----' '--'
```

Similarly, you can use Promise API:

```js
try {
  console.log(
    await figlet.text("Boo!", {
      font: "Ghost",
      horizontalLayout: "default",
      verticalLayout: "default",
      width: 80,
      whitespaceBreak: true,
    })
  );
} catch (err) {
  console.log("Something went wrong...");
  console.dir(err);
}
```

This will print the same output.

### textSync

This method is the synchronous version of the method above.

- Input Text - A string of text to turn into ASCII Art.
- Font Options - Either a string indicating the font name or an options object (description below).

Example:

```js
console.log(
  figlet.textSync("Boo!", {
    font: "Ghost",
    horizontalLayout: "default",
    verticalLayout: "default",
    width: 80,
    whitespaceBreak: true,
  })
);
```

That will print out:

```
.-. .-')                            ,---.
\  ( OO )                           |   |
 ;-----.\  .-'),-----.  .-'),-----. |   |
 | .-.  | ( OO'  .-.  '( OO'  .-.  '|   |
 | '-' /_)/   |  | |  |/   |  | |  ||   |
 | .-. `. \_) |  |\|  |\_) |  |\|  ||  .'
 | |  \  |  \ |  | |  |  \ |  | |  |`--'
 | '--'  /   `'  '-'  '   `'  '-'  '.--.
 `------'      `-----'      `-----' '--'
```

### Options

The options object has several parameters which you can set:

#### font

Type: `String`
Default value: `'Standard'`

A string value that indicates the FIGlet font to use.

#### horizontalLayout

Type: `String`
Default value: `'default'`

A string value that indicates the horizontal layout to use. 5 possible values for this: "default", "full", "fitted", "controlled smushing", and "universal smushing". "default" does the kerning the way the font designer intended, "full" uses full letter spacing, "fitted" moves the letters together until they almost touch, and "controlled smushing" and "universal smushing" are common FIGlet kerning setups.

#### verticalLayout

Type: `String`
Default value: `'default'`

A string value that indicates the vertical layout to use. 5 possible values for this: "default", "full", "fitted", "controlled smushing", and "universal smushing". "default" does the kerning the way the font designer intended, "full" uses full letter spacing, "fitted" moves the letters together until they almost touch, and "controlled smushing" and "universal smushing" are common FIGlet kerning setups.

#### width

Type: `Number`
Default value: `undefined`

This option allows you to limit the width of the output. For example, if you want your output to be a max of 80 characters wide, you would set this option to 80. [Example](https://github.com/patorjk/figlet.js/blob/master/examples/front-end/index.htm)

#### whitespaceBreak

Type: `Boolean`
Default value: `false`

This option works in conjunction with "width". If this option is set to true, then the library will attempt to break text up on whitespace when limiting the width. [Example](https://github.com/patorjk/figlet.js/blob/master/examples/front-end/index.htm)

### Understanding Kerning

The 2 layout options allow you to override a font's default "kerning". Below you can see how this effects the text. The string "Kerning" was printed using the "Standard" font with horizontal layouts of "default", "fitted" and then "full".

```
  _  __               _
 | |/ /___ _ __ _ __ (_)_ __   __ _
 | ' // _ \ '__| '_ \| | '_ \ / _` |
 | . \  __/ |  | | | | | | | | (_| |
 |_|\_\___|_|  |_| |_|_|_| |_|\__, |
                              |___/
  _  __                   _
 | |/ / ___  _ __  _ __  (_) _ __    __ _
 | ' / / _ \| '__|| '_ \ | || '_ \  / _` |
 | . \|  __/| |   | | | || || | | || (_| |
 |_|\_\\___||_|   |_| |_||_||_| |_| \__, |
                                    |___/
  _  __                        _
 | |/ /   ___   _ __   _ __   (_)  _ __     __ _
 | ' /   / _ \ | '__| | '_ \  | | | '_ \   / _` |
 | . \  |  __/ | |    | | | | | | | | | | | (_| |
 |_|\_\  \___| |_|    |_| |_| |_| |_| |_|  \__, |
                                           |___/
```

In most cases you'll either use the default setting or the "fitted" setting. Most fonts don't support vertical kerning, but a hand full of them do (like the "Standard" font).

### metadata

The metadata function allows you to retrieve a font's default options and header comment. Example usage:

```js
figlet.metadata("Standard", function (err, options, headerComment) {
  if (err) {
    console.log("something went wrong...");
    console.dir(err);
    return;
  }
  console.dir(options);
  console.log(headerComment);
});
```

The function also return a promise that return an array with two values:

```js
try {
  const [options, headerComment] = await figlet.metadata("Standard");
  console.dir(options);
  console.log(headerComment);
} catch (err) {
  console.log("something went wrong...");
  console.dir(err);
}
```

### fonts

The fonts function allows you to get a list of all of the available fonts. Example usage:

```js
figlet.fonts(function (err, fonts) {
  if (err) {
    console.log("something went wrong...");
    console.dir(err);
    return;
  }
  console.dir(fonts);
});
```

For Node, it will look in the fonts folder and list all of the fonts there - this folder is configurable in case you want to use your own folder (see the `defaults` method).

When dealing with this code in the browser, it will return a list of all of the fonts that come with this library. If you only want a list of the fonts that have been loaded into memory (ie, fetched and parsed and currently usable), use the `loadedFonts` method (this also returns a list of strings).

### fontsSync

The synchronous version of the fonts method

```js
console.log(figlet.fontsSync());
```

As with `fonts`, when used in the browser this will list all of the fonts that come with this library.

### loadedFonts

When you call `loadFont` or `parseFont`, the font information gets processed and put into an internal array. This method allows you to see all of the fonts that have been loaded. It returns an array of font names.

### clearLoadedFonts

Resets the internal state so that no fonts have been loaded.

### parseFont

Allows you to use a font from another source.

```js
const fs = require("fs");
const path = require("path");

let data = fs.readFileSync(path.join(__dirname, "myfont.flf"), "utf8");
figlet.parseFont("myfont", data);
console.log(figlet.textSync("myfont!", "myfont"));
```

### defaults

Allows you to set a handful of default values for the library. Ex:

```js
figlet.defaults({
  font: "Standard", // default font
  fontPath: "some-random-place/fonts", // default font path location
  fetchFontIfMissing: true, // for the browser, fetch a font if its missing
})
```

## Getting Started - Browser with ES modules

Here's the basic ES module usage:

```js
import figlet from "figlet";
import standard from "figlet/fonts/Standard";

figlet.parseFont("Standard", standard);

async function doStuff() {
  const text = await figlet.text("test", { font: "Standard" });
  console.log(text);
}

doStuff();
```

In previous versions you imported js files from an importable-fonts folder. This still works, but the new way is slightly cleaner.

If you attempt to access a font that doesn't exist, the library will attempt to fetch it. You can control the fetch location via the `fontPath` property in `defaults`. If you want to disable this behavior (fetching a font if it doesn't exist), set `fetchFontIfMissing` to false (with the `defaults` method).

### textSync

The browser API supports synchronous mode as long as the fonts have been loaded or preloaded.

Example:

```js
figlet.defaults({ fontPath: "assets/fonts" });

figlet.preloadFonts(["Standard", "Ghost"], ready);

function ready() {
  console.log(figlet.textSync("ASCII"));
  console.log(figlet.textSync("Art", "Ghost"));
}
```

That will print out:

```
     _     ____    ____  ___  ___
    / \   / ___|  / ___||_ _||_ _|
   / _ \  \___ \ | |     | |  | |
  / ___ \  ___) || |___  | |  | |
 /_/   \_\|____/  \____||___||___|

   ('-.     _  .-')   .-') _
  ( OO ).-.( \( -O ) (  OO) )
  / . --. / ,------. /     '._
  | \-.  \  |   /`. '|'--...__)
.-'-'  |  | |  /  | |'--.  .--'
 \| |_.'  | |  |_.' |   |  |
  |  .-.  | |  .  '.'   |  |
  |  | |  | |  |\  \    |  |
  `--' `--' `--' '--'   `--'

```

See the examples folder for a more robust front-end example.

## Getting Started - Command Line

To use figlet.js on the command line, install globally:

```sh
npm install -g figlet
```

And then you should be able run from the command line. Example:

```sh
figlet -f "Dancing Font" "Hi"
```

## Contributors

Thanks goes to these people: ([emoji key](https://allcontributors.org/docs/en/emoji-key))

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="http://patorjk.com/"><img src="https://avatars.githubusercontent.com/u/521224?v=4?s=100" width="100px;" alt="patorjk"/><br /><sub><b>patorjk</b></sub></a><br /><a href="#code-patorjk" title="Code">💻</a> <a href="#doc-patorjk" title="Documentation">📖</a> <a href="#test-patorjk" title="Tests">⚠️</a> <a href="#infra-patorjk" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#example-patorjk" title="Examples">💡</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://jcu.bi"><img src="https://avatars.githubusercontent.com/u/280241?v=4?s=100" width="100px;" alt="Jakub T. Jankiewicz"/><br /><sub><b>Jakub T. Jankiewicz</b></sub></a><br /><a href="#code-jcubic" title="Code">💻</a> <a href="#doc-jcubic" title="Documentation">📖</a> <a href="#test-jcubic" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://tracker1.dev/"><img src="https://avatars.githubusercontent.com/u/444316?v=4?s=100" width="100px;" alt="Michael J. Ryan"/><br /><sub><b>Michael J. Ryan</b></sub></a><br /><a href="#code-tracker1" title="Code">💻</a> <a href="#doc-tracker1" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/seriousManual"><img src="https://avatars.githubusercontent.com/u/1330022?v=4?s=100" width="100px;" alt="Manuel Ernst"/><br /><sub><b>Manuel Ernst</b></sub></a><br /><a href="#code-seriousManual" title="Code">💻</a> <a href="#doc-seriousManual" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/eiriksm"><img src="https://avatars.githubusercontent.com/u/865153?v=4?s=100" width="100px;" alt="Eirik Stanghelle Morland"/><br /><sub><b>Eirik Stanghelle Morland</b></sub></a><br /><a href="#infra-eiriksm" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://und.ooo"><img src="https://avatars.githubusercontent.com/u/46262811?v=4?s=100" width="100px;" alt="George"/><br /><sub><b>George</b></sub></a><br /><a href="#example-Horhik" title="Examples">💡</a> <a href="#doc-Horhik" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://websemantics.ca"><img src="https://avatars.githubusercontent.com/u/2190455?v=4?s=100" width="100px;" alt="Adnan M.Sagar, PhD"/><br /><sub><b>Adnan M.Sagar, PhD</b></sub></a><br /><a href="#code-websemantics" title="Code">💻</a> <a href="#doc-websemantics" title="Documentation">📖</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="http://abhishekchoudhary.com.np"><img src="https://avatars.githubusercontent.com/u/61597896?v=4?s=100" width="100px;" alt="Abhishek Choudhary"/><br /><sub><b>Abhishek Choudhary</b></sub></a><br /><a href="#doc-shreemaan-abhishek" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/JasonGoemaat"><img src="https://avatars.githubusercontent.com/u/114062?v=4?s=100" width="100px;" alt="Jason"/><br /><sub><b>Jason</b></sub></a><br /><a href="#code-JasonGoemaat" title="Code">💻</a> <a href="#doc-JasonGoemaat" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/mbodomi"><img src="https://avatars.githubusercontent.com/u/390802?v=4?s=100" width="100px;" alt="mbodomi"/><br /><sub><b>mbodomi</b></sub></a><br /><a href="#design-mbodomi" title="Design">🎨</a> <a href="#code-mbodomi" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://orkhan-huseyn.github.io"><img src="https://avatars.githubusercontent.com/u/21221412?v=4?s=100" width="100px;" alt="Orkhan Huseynli"/><br /><sub><b>Orkhan Huseynli</b></sub></a><br /><a href="#code-orkhan-huseyn" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://melcher.io"><img src="https://avatars.githubusercontent.com/u/35605787?v=4?s=100" width="100px;" alt="Domenic Melcher"/><br /><sub><b>Domenic Melcher</b></sub></a><br /><a href="#doc-LetsMelon" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/a-raccoon"><img src="https://avatars.githubusercontent.com/u/1052090?v=4?s=100" width="100px;" alt="a-raccoon"/><br /><sub><b>a-raccoon</b></sub></a><br /><a href="#doc-a-raccoon" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://about.me/peterdehaan"><img src="https://avatars.githubusercontent.com/u/557895?v=4?s=100" width="100px;" alt="Peter deHaan"/><br /><sub><b>Peter deHaan</b></sub></a><br /><a href="#doc-pdehaan" title="Documentation">📖</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://ionicabizau.net"><img src="https://avatars.githubusercontent.com/u/2864371?v=4?s=100" width="100px;" alt="Ionică Bizău (Johnny B.)"/><br /><sub><b>Ionică Bizău (Johnny B.)</b></sub></a><br /><a href="#doc-IonicaBizau" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.t1st3.com/"><img src="https://avatars.githubusercontent.com/u/1469638?v=4?s=100" width="100px;" alt="t1st3"/><br /><sub><b>t1st3</b></sub></a><br /><a href="#code-t1st3" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/timhudson"><img src="https://avatars.githubusercontent.com/u/122594?v=4?s=100" width="100px;" alt="Tim Hudson"/><br /><sub><b>Tim Hudson</b></sub></a><br /><a href="#code-timhudson" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Lev-Shapiro"><img src="https://avatars.githubusercontent.com/u/96536068?v=4?s=100" width="100px;" alt="Lev-Shapiro"/><br /><sub><b>Lev-Shapiro</b></sub></a><br /><a href="#code-Lev-Shapiro" title="Code">💻</a> <a href="#example-Lev-Shapiro" title="Examples">💡</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

## Release History

- 2025.09.17 v1.9.3 Type fix for figlet module base call (when calling figlet as shorthand for figlet.text)
- 2025.09.15 v1.9.2 Type fix for figlet module for TypeScript with Node
- 2025.09.08 v1.9.1 Adjustment for older versions of node: Added if statement around structuredClone operation.
- 2025.09.07 v1.9.0 TypeScript refactor. Added Toilet fonts.
- 2025.07.11 v1.8.2 Added Terrace and Wavescape fonts. Fixed tag validation (https://github.com/patorjk/figlet.js/pull/134) thanks to @deverac
- 2025.04.11 v1.8.1 Added miniwi font.
- 2024.10.08 v1.8.0 Added support for promises for loadFont, preloadedFonts, and metadata methods. 5 fonts added: DiamFont, RubiFont, CosMike2, BlurVision ASCII, and Shaded Blocky.
- 2023.10.01 v1.7.0 Added support for promises for text method.
- 2023.04.08 v1.6.0 Added npx support (ex: npx figlet test).
- 2021.08.11 v1.5.2 Minor bug fixes.
- 2020.07.12 v1.5.1 Fixed with vertical smushing, updated lodash version.
- 2020.07.12 v1.5.0 Added width and whitespaceBreak options.
- 2020.04.26 v1.4.0 Removed jQuery from preloader and examples.
- 2020.02.23 v1.3.0 Added the "ANSI Regular" font and updated the README with info on how to use with Webpack.
- 2018.03.26 v1.2.1 parseFont works in node for adding fonts manually
- 2016.09.27 v1.2.0 jQuery replaced with fetch API / polyfill.
- 2016.04.28 v1.1.2 textSync now works in the browser with font pre-loading.
- 2014.08.15 v1.1.0 Sync functions added.
- 2014.07.31 v1.0.1 Bug fixes.
- 2013.12.28 v1.0.7 README update and minor tweaks.
- 2013.01.02 v1.0.8 Added tests and command line info.

