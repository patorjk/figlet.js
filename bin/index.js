#!/usr/bin/node
const figlet = require('../lib/node-figlet');

const [text] = process.argv.slice(2);

if (!text) {
    throw new Error('You need to provide a text.');
}

figlet(text, function (err, formattedText) {
    if (err) {
        throw err;
    }
    console.log(formattedText);
});
