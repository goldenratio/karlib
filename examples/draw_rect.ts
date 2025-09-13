import { BrowserEnv, BrowserTicker, Karlib } from "../src";

export async function main(canvas: HTMLCanvasElement): Promise<void> {
  const { width, height } = canvas;
  const rect_width = 100;
  const rect_height = 100;

  let x = canvas.width / 2 - 50;
  let y = canvas.height / 2 - 50;
  let vx = Math.random() * 10 - 5;
  let vy = Math.random() * 10 - 5;

  const kl = new Karlib({ canvas, env: new BrowserEnv() });

  const ticker = new BrowserTicker();
  ticker.on_tick((delta) => {
    // Update position
    x += vx * delta;
    y += vy * delta;

    // Bounce off horizontal walls
    if (x + rect_width >= width || x <= 0) {
      vx *= -1;
      x = x + rect_width >= width ? width - rect_width : 0;
    }

    // Bounce off vertical walls
    if (y + rect_height >= height || y <= 0) {
      vy *= -1;
      y = y + rect_height >= height ? height - rect_height : 0;
    }

    // draw
    kl.clear_background("#000");
    kl.draw_rectangle({
      x: x | 0,
      y: y | 0,
      width: rect_width,
      height: rect_height,
    });
  });
}
