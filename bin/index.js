#!/usr/bin/env node
const figlet = require("../lib/node-figlet");

const [text] = process.argv.slice(2);

if (!text) {
  throw new Error("You need to provide some text.");
}

figlet(text, function (err, formattedText) {
  if (err) {
    throw err;
  }
  console.log(formattedText);
});
