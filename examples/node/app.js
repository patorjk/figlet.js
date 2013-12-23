var figlet = require('../../lib/node-figlet.js');

figlet.loadFont('Standard', function(err) {
    if (err) {
        console.log('Something went wrong...');
        console.dir(err);
        return;
    }

    var txt = figlet.getText('Boo!');
    console.log(txt);
});