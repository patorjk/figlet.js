/*
	Node plugin for figlet.js
*/

var figlet = require('./figlet.js'),
    fs = require('fs');

figlet.loadFont = function(name, next) {
    fs.readFile(__dirname + '/../fonts/'+name+'.flf',  {encoding: 'utf-8'}, function(err, data) {
        if (err) {
            next(err);
            return;
        }
        figlet.load(data);
        next();
    });
};

figlet.getFontList = function(next) {
    // TODO: implement this
};

module.exports = figlet;