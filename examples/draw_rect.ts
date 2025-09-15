import { BrowserEnv, BrowserTicker, Karlib } from "../src";

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

export async function main(canvas: HTMLCanvasElement): Promise<void> {
  const rect_width = 100;
  const rect_height = 100;

  let x = canvas.width / 2 - rect_width / 2;
  let y = canvas.height / 2 - rect_height / 2;

  let vx = Math.random() * 10 - 5;
  let vy = Math.random() * 10 - 5;

  const kl = new Karlib({ canvas, env: new BrowserEnv() });

  const ticker = new BrowserTicker();
  ticker.on_tick((delta) => {
    // Update position
    x += vx * delta;
    y += vy * delta;

    // Bounce off horizontal walls
    if (x + rect_width >= CANVAS_WIDTH || x <= 0) {
      vx *= -1;
    }

    // Bounce off vertical walls
    if (y + rect_height >= CANVAS_HEIGHT || y <= 0) {
      vy *= -1;
    }

    // draw
    kl.clear_background("#000");
    kl.draw_rectangle({
      x: x,
      y: y,
      width: rect_width,
      height: rect_height,
    });
  });
}
