```
___________.___  ________.__          __          __        
\_   _____/|   |/  _____/|  |   _____/  |_       |__| ______
 |    __)  |   /   \  ___|  | _/ __ \   __\      |  |/  ___/
 |     \   |   \    \_\  \  |_\  ___/|  |        |  |\___ \ 
 \___  /   |___|\______  /____/\___  >__| /\ /\__|  /____  >
     \/                \/          \/     \/ \______|    \/ 

```

This project aims to fully implement the FIGfont spec in JavaScript. It works in the browser and with Node.js. You can see it in action here: http://patorjk.com/software/taag/ (the figlet.js file was written to power that application)

Quick Start - Node.js
-------------------------

Install:

```
npm install figlet
```

Simple usage:

```
var figlet = require('figlet');

figlet('Hello World!!', function(err, data) {
    if (err) {
        console.log('Something went wrong...');
        console.dir(err);
        return;
    }
    console.log(data)
});
```

That should print out:

```
  _   _      _ _        __        __         _     _ _ _ 
 | | | | ___| | | ___   \ \      / /__  _ __| | __| | | |
 | |_| |/ _ \ | |/ _ \   \ \ /\ / / _ \| '__| |/ _` | | |
 |  _  |  __/ | | (_) |   \ V  V / (_) | |  | | (_| |_|_|
 |_| |_|\___|_|_|\___/     \_/\_/ \___/|_|  |_|\__,_(_|_)
```

Basic Usage - Node.js
-------------------------

There are 3 main functions on the figlet object.

### text

Calling the figlet object as a function is shorthand for calling the text function. This method allows you to create ASCII Art from text. It takes in 3 parameters:

* Input Text - A string of text to turn into ASCII Art.
* Font Options - Either a string indicating the font name or an options object (description below).
* Callback - A function to execute with the generated ASCII Art.

Example:

```
figlet.text('Boo!', {
    font: 'Ghost',
    horizontalLayout: 'default',
    verticalLayout: 'default'
}, function(err, data) {
    if (err) {
        console.log('Something went wrong...');
        console.dir(err);
        return;
    }
    console.log(data);
});
```

That will print out:

```
.-. .-')                            ,---. 
\  ( OO )                           |   | 
 ;-----.\  .-'),-----.  .-'),-----. |   | 
 | .-.  | ( OO'  .-.  '( OO'  .-.  '|   | 
 | '-' /_)/   |  | |  |/   |  | |  ||   | 
 | .-. `. \_) |  |\|  |\_) |  |\|  ||  .' 
 | |  \  |  \ |  | |  |  \ |  | |  |`--'  
 | '--'  /   `'  '-'  '   `'  '-'  '.--.  
 `------'      `-----'      `-----' '--' 
```

#### Font Options

The font options object has 3 parameters which you can set:

##### font
Type: `String`
Default value: `'Standard'`

A string value that indicates the FIGlet font to use.

##### horizontalLayout
Type: `String`
Default value: `'default'`

A string value that indicates the horizontal layout to use. FIGlet fonts have 5 possible values for this: "default", full", "fitted", "controlled smushing", and "universal smushing". "default" does the kerning the way the font designer intended, "full" uses full letter spacing, "fitted" moves the letters together until they almost touch, and "controlled smushing" and "universal smushing" are common FIGlet kerning setups.

##### verticalLayout
Type: `String`
Default value: `'default'`

A string value that indicates the vertical layout to use. FIGlet fonts have 5 possible values for this: "default", full", "fitted", "controlled smushing", and "universal smushing". "default" does the kerning the way the font designer intended, "full" uses full letter spacing, "fitted" moves the letters together until they almost touch, and "controlled smushing" and "universal smushing" are common FIGlet kerning setups.

#### kerning

The layout options allow you to override a font's default "kerning". Below you can see how this effects the text. The string "Kerning" was printed using the "Standard" font with horiontal layouts of "default", "fitted" and then "full".

```
  _  __               _             
 | |/ /___ _ __ _ __ (_)_ __   __ _ 
 | ' // _ \ '__| '_ \| | '_ \ / _` |
 | . \  __/ |  | | | | | | | | (_| |
 |_|\_\___|_|  |_| |_|_|_| |_|\__, |
                              |___/ 
  _  __                   _               
 | |/ / ___  _ __  _ __  (_) _ __    __ _ 
 | ' / / _ \| '__|| '_ \ | || '_ \  / _` |
 | . \|  __/| |   | | | || || | | || (_| |
 |_|\_\\___||_|   |_| |_||_||_| |_| \__, |
                                    |___/ 
  _  __                        _                 
 | |/ /   ___   _ __   _ __   (_)  _ __     __ _ 
 | ' /   / _ \ | '__| | '_ \  | | | '_ \   / _` |
 | . \  |  __/ | |    | | | | | | | | | | | (_| |
 |_|\_\  \___| |_|    |_| |_| |_| |_| |_|  \__, |
                                           |___/ 
```

In most cases you'll either use the default setting or the "fitted" setting. Most fonts don't support vertical kerning, but a hand full fo them do (like the "Standard" font).

### metadata

The metadata function allows you to retrieve a font's default options and header comment. Example usage:

```
figlet.metadata('Standard', function(err, options, headerComment) {
    if (err) {
        console.log('something went wrong...');
        console.dir(err);
        return;
    }
    console.dir(options);
    console.log(headerComment);
});
```

### fonts

The fonts function allows you to get a list of all of the available fonts. Example usage:

```
figlet.fonts(function(err, fonts) {
    if (err) {
        console.log('something went wrong...');
        console.dir(err);
        return;
    }
    console.dir(fonts);
});
```


Getting Started - The Browser
-------------------------

The browser API is the same as the Node API with the exception of the "fonts" method not being available. The browser version also requires jQuery (any version should work as it only utilizes the ajax method for its loadFont function).

Example usage:

```
<script type="text/javascript" src="jquery-1.7.2.min.js"></script>
<script type="text/javascript" src="figlet.js"></script>
    
<script>

    figlet(inputText, 'Standard', function(err, text) {
        if (err) {
            console.log('something went wrong...');
            console.dir(err);
            return;
        }
        console.log(text);
    });

</script>
```

See the examples folder for a more robust front-end example.

Getting Started - Command Line
-------------------------

To use figlet.js on the command line, install figlet-cli:

```shell
npm install -g figlet-cli
```

And then you should be able run from the command line. Example:

```shell
figlet -f "Dancing Font" "Hi"
```

For more info see the [figlet-cli](https://github.com/patorjk/figlet-cli). 

## Release History
* 2013.01.02 v1.0.8 Added tests and command line info.
* 2013.12.28 v1.0.7 README update and minor tweaks.
* 2013.12.28 v1.0.10 Bug fixes.
