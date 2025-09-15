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
npm run example draw_rect
```
Check [examples](./examples) folder for list of examples to run.

## Basic Example

[Preview](https://codepen.io/kuuuurija/pen/myeZLyK)

```html
<!DOCTYPE html>
<html>
<head>
  <title>Example</title>
</head>
<body>
  <div><canvas id="my_game" width="800" height="600"></canvas></div>

  <script type="module">
    import { BrowserEnv, Karlib, BrowserTicker } from "https://unpkg.com/@goldenratio/karlib@latest/target/karlib.js";

    async function main() {
      const canvas = document.getElementById("my_game");
      const { width, height } = canvas;

      const rect_width = 100;
      const rect_height = 100;

      let x = canvas.width / 2 - 50;
      let y = canvas.height / 2 - 50;

      let vx = Math.random() * 10 - 5;
      let vy = Math.random() * 10 - 5;

      const kl = new Karlib({canvas, env: new BrowserEnv()});

      const ticker = new BrowserTicker();
      ticker.on_tick((delta) => {
        // Update position
        x += vx * delta;
        y += vy * delta;

        // Bounce off horizontal walls
        if (x + rect_width >= width || x <= 0) {
          vx *= -1;
        }

        // Bounce off vertical walls
        if (y + rect_height >= height || y <= 0) {
          vy *= -1;
        }

        // draw
        kl.clear_background("#000");
        kl.draw_rectangle({
          x: x | 0,
          y: y | 0,
          width: rect_width,
          height: rect_height,
          fill_style: "#ff0000",
        });
      });

    }

    main();
  </script>

</body>
</html>
```

## Showcase

Games created using karlib:

- [Cat-aplut](https://labrat.mobi/games/catapult/)

## Inspirations

- [Raylib](https://www.raylib.com/)
- [Tsoding](https://www.youtube.com/watch?v=maSIQg8IFRI)

## Release

### NPM
```
npm version {major | minor | patch}
npm publish
```
