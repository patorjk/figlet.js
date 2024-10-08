/*
	Node plugin for figlet.js
*/

const figlet = require("./figlet.js"),
  fs = require("fs"),
  path = require("path"),
  fontDir = path.join(__dirname, "/../fonts/");

/*
    Loads a font into the figlet object.

    Parameters:
    - name (string): Name of the font to load.
    - next (function): Callback function.
*/
figlet.loadFont = function (name, next) {
  return new Promise(function(resolve, reject) {
    if (figlet.figFonts[name]) {
      next && next(null, figlet.figFonts[name].options);
      resolve(figlet.figFonts[name].options);
      return;
    }

    fs.readFile(
      path.join(fontDir, name + ".flf"),
      { encoding: "utf-8" },
      function (err, fontData) {
        if (err) {
          next && next(err);
          reject(err);
          return;
        }

        fontData = fontData + "";
        try {
          var font = figlet.parseFont(name, fontData);
          next && next(null, font);
          resolve(font);
        } catch (error) {
          next && next(error);
          reject(error);
        }
      }
    );
  });
};

/*
 Loads a font synchronously into the figlet object.

 Parameters:
 - name (string): Name of the font to load.
 */
figlet.loadFontSync = function (name) {
  if (figlet.figFonts[name]) {
    return figlet.figFonts[name].options;
  }

  var fontData = fs.readFileSync(path.join(fontDir, name + ".flf"), {
    encoding: "utf-8",
  });

  fontData = fontData + "";
  return figlet.parseFont(name, fontData);
};

/*
    Returns an array containing all of the font names
*/
figlet.fonts = function (next) {
  return new Promise(function(resolve, reject) {
    var fontList = [];
    fs.readdir(fontDir, function (err, files) {
      // '/' denotes the root folder
      if (err) {
        next && next(err);
        reject(err);
        return;
      }

      files.forEach(function (file) {
        if (/\.flf$/.test(file)) {
          fontList.push(file.replace(/\.flf$/, ""));
        }
      });

      next && next(null, fontList);
      resolve(fontList);
    });
  });
};

figlet.fontsSync = function () {
  var fontList = [];
  fs.readdirSync(fontDir).forEach(function (file) {
    if (/\.flf$/.test(file)) {
      fontList.push(file.replace(/\.flf$/, ""));
    }
  });

  return fontList;
};

module.exports = figlet;
