import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fontDir = path.join(__dirname, "/../fonts/");
const srcDir = path.join(__dirname, "/../src/");

const fontList = [];
fs.readdir(fontDir, function (err, files) {
  if (err) {
    console.error(err);
    return;
  }

  files.forEach(function (file) {
    if (/\.flf$/.test(file)) {
      fontList.push('"' + file.replace(/\.flf$/, "") + '"');
    }
  });

  // write index file
  const outputPath = path.join(srcDir, "font-list.ts");
  fs.writeFileSync(
    outputPath,
    `
export const fontList = [\n${fontList.join(",\n")}\n];
`,
    "utf8"
  );
});
