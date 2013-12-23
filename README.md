```
___________.___  ________.__          __          __        
\_   _____/|   |/  _____/|  |   _____/  |_       |__| ______
 |    __)  |   /   \  ___|  | _/ __ \   __\      |  |/  ___/
 |     \   |   \    \_\  \  |_\  ___/|  |        |  |\___ \ 
 \___  /   |___|\______  /____/\___  >__| /\ /\__|  /____  >
     \/                \/          \/     \/ \______|    \/ 

```

This project aims to fully implement the FIGfont spec in JavaScript. It works in the browser and with Node.js. You can see it in action here: http://patorjk.com/software/taag/ (the figlet.js file was written to power that application)

Getting Started - Node.js
-------------------------

Install:

```
npm install figlet
```

Example usage:

```
var figlet = require('figlet');

figlet.loadFont('Standard', function(err) {
    if (err) {
        console.log('Something went wrong...');
        console.dir(err);
        return;
    }

    var txt = figlet.getText('Hello World!');
    console.log(txt);
});
```

Getting Started - The Browser
-------------------------

In the browser you can use the figloader.js file to dynamically request a font file (see the examples).

```
<script type="text/javascript" src="jquery-1.7.2.min.js"></script>
<script type="text/javascript" src="figloader.js"></script>
<script type="text/javascript" src="figlet.js"></script>
    
<script>

var myFiglet = new Figlet();

// you'll need to correctly indicate where the fonts are stored
FigletLoader.load(myFiglet, "fonts/Doom.flf", function(data) {
    myFiglet.load(data); 
    console.log( myFiglet.getText("Hello World!") );
});

</script>
```

The doc/figfont.txt file in this project contains the FIGlet FIGfont spec.