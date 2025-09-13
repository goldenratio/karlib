# karlib

> A minimal HTML5 canvas rendering library. Fine tuned for web games development.


> [!WARNING]
> This library is in alpha state

## Install

### NPM

```console
npm install --save @goldenratio/karlib
```

https://www.npmjs.com/package/@goldenratio/karlib

## Run Examples

```console
npm run example shape_2d
```
Check [examples](./examples) folder for list of examples to run.

## Basic Example

```html
<!DOCTYPE html>
<html>
<head>
  <title>Example</title>
</head>
<body>
  <div><canvas id="my_game" width="800" height="600"></canvas></div>

  <script type="module">
    import { Karlib, BrowserEnv, BrowserTicker } from "https://unpkg.com/@goldenratio/karlib@latest/target/karlib.js";

    async function main() {
      const canvas = document.getElementById("my_game");

      const kl = new Karlib({
        canvas: canvas,
        env: new BrowserEnv(),
      });

      const ticker = new BrowserTicker();
      ticker.on_tick((delta) => {
        kl.clear_background("#000");
        kl.draw_rectangle({
          x: 100,
          y: 100,
          width: 100,
          height: 100,
          fill_style: "#ff0000",
        });
      });
    }

    main();
  </script>

</body>
</html>
```

## Release

### NPM
```
npm version {major | minor | patch}
npm publish
```
