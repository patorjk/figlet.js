import path from "path";
import fs from "fs";
import {fileURLToPath} from "url";
import {renamedFonts} from '../src/renamed-fonts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fontDir = path.join(__dirname, "/../fonts/");
const exportDir = path.join(__dirname, "../importable-fonts/");

function flipKeysAndValues(obj) {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [`${value}.flf`, `${key}.flf`])
  );
}

function writeImportFile(name, fontData) {
  fs.writeFileSync(
    path.join(exportDir, name.replace(/flf$/, "js")),
    fontData,
    {encoding: "utf-8"}
  );

  const fontTypeData = `declare const fontData: string;\nexport default fontData;\n`;
  fs.writeFileSync(
    path.join(exportDir, name.replace(/flf$/, "d.ts")),
    fontTypeData,
    {encoding: "utf-8"}
  );
}

const renameMap = flipKeysAndValues(renamedFonts);

fs.readdir(fontDir, function (err, files) {
  if (err) {
    console.error(err);
    return;
  }

  files.forEach(function (name) {
    if (/\.flf$/.test(name)) {
      let fontData = fs.readFileSync(path.join(fontDir, name), {
        encoding: "utf-8",
      });
      fontData =
        "export default `" +
        fontData.replace(/\\/g, "\\\\").replace(/`/g, "\\`") +
        "`";

      writeImportFile(name, fontData);

      if (renameMap[name]) {
        writeImportFile(renameMap[name], fontData);
      }
    }
  });
});
