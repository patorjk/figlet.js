#!/usr/bin/env node
var figlet = require('../lib/node-figlet');

var optimist = require('optimist')
    .usage('Usage: $0 "text to print"')
    .alias('h', 'help')
    .alias('v', 'version')
    .alias('l', 'list')
    .describe('l', 'List all the available fonts')
    .alias('f', 'font')
    .describe('f', 'A string value that indicates the FIGlet font to use')
    .describe('horizontal-layout', 'A string value that indicates the horizontal layout to use')
    .describe('vertical-layout', 'A string value that indicates the vertical layout to use');

var argv = optimist.argv;
var text = argv._.join(' ');
var options = {};

if (argv.version) {
    return console.log(require('../package.json').version);
}

if (argv.list) {
    figlet.fonts(function(err, fonts) {
        if (err) {
          console.log('something went wrong...');
          console.dir(err);
          return;
        }
        fonts.forEach(function(font) {
            console.log(font);
        });
    });
    return;
}

if (!text || argv.help) {
    return console.log(optimist.help());
}

if (argv.font) options.font = argv.font
if (argv['horizontal-layout']) options.horizontalLayout = argv['horizontal-layout']
if (argv['vertical-layout']) options.verticalLayout = argv['vertical-layout']

figlet(text, options, function(err, data) {
    if (err) {
        console.log('Something went wrong...');
        console.dir(err);
        return;
    }
    console.log(data);
});