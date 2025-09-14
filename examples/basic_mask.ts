import { BrowserEnv, BrowserTicker, Karlib, unwrap } from "../src";

export const CANVAS_WIDTH = 918;
export const CANVAS_HEIGHT = 515;

export async function main(canvas: HTMLCanvasElement): Promise<void> {
  const { width, height } = canvas;
  const mask_radius = 100;

  let x = canvas.width / 2 - 50;
  let y = canvas.height / 2 - 50;
  let vx = Math.random() * 10 - 5;
  let vy = Math.random() * 10 - 5;

  const kl = new Karlib({
    canvas: canvas,
    env: new BrowserEnv(),
    pixel_perfect: true,
  });

  const img_texture = unwrap(await kl.load_texture("./sample_background.png"), "err");

  const ticker = new BrowserTicker();
  ticker.on_tick((delta) => {
    // Update position
    x += vx * delta;
    y += vy * delta;

    // Bounce off horizontal walls
    if (x + mask_radius >= width || x <= mask_radius) {
      vx *= -1;
      x = x + mask_radius >= width ? width - mask_radius : mask_radius;
    }

    // Bounce off vertical walls
    if (y + mask_radius >= height || y <= mask_radius) {
      vy *= -1;
      y = y + mask_radius >= height ? height - mask_radius : mask_radius;
    }

    // draw
    kl.clear_background("#000");

    kl.begin_scissor_mode({ x: x | 0, y: y | 0, radius: 100 });
    kl.draw_texture({
      texture: img_texture,
      x: 0,
      y: 0,
    });
    kl.end_scissor_mode();
  });
}
