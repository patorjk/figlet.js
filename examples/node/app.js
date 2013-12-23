/*
    Example
*/

var figlet = require('../../lib/node-figlet.js');

/*
    Once this has been run:
    
    npm install figlet

    Use the below line instead of the above line
*/
// var figlet = require('figlet');

figlet.loadFont('Standard', function(err) {
    if (err) {
        console.log('Something went wrong...');
        console.dir(err);
        return;
    }

    var txt = figlet.getText('Boo!');
    console.log(txt);
});