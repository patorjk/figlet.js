/*
    Example
*/

import figlet from "../../dist/node-figlet.mjs";

/*
    Once this has been run:

    npm install figlet

    Use the below line instead of the above line
*/

(async () => {
  const helloWorld = await figlet("Async World!", "Standard");
  console.log(helloWorld);

  const example2 = await figlet.text("Async Example", "Graffiti");
  console.log(example2);

  const example3 = await figlet.text("Bonus Example.", {
    font: "Standard",
    horizontalLayout: "full",
    verticalLayout: "full",
  });

  console.log(example3);

  figlet("Callback World!", "Standard", function (err, data) {
    if (err) {
      console.log("Something went wrong...");
      console.dir(err);
      return;
    }

    console.log(data);

    figlet.text("Callback Example", "Graffiti", function (err, data) {
      if (err) {
        console.log("Something went wrong...");
        console.dir(err);
        return;
      }

      console.log(data);
    });
  });
})();
