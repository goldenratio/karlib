import { BrowserEnv, BrowserTicker, Karlib } from "../src";

export const CANVAS_WIDTH = 918;
export const CANVAS_HEIGHT = 515;

export async function main(canvas: HTMLCanvasElement): Promise<void> {
  const mask_radius = 150;

  let x = CANVAS_WIDTH / 2 - mask_radius;
  let y = CANVAS_HEIGHT / 2 - mask_radius;
  let vx = Math.random() * 10 - 5;
  let vy = Math.random() * 10 - 5;

  const kl = new Karlib({ canvas, env: new BrowserEnv() });

  await kl.load_texture("./sample_background.png");
  await kl.load_texture("./character_green_front.png");
  await kl.load_texture("./texture_mask_blur.png");

  const ticker = new BrowserTicker();
  ticker.on_tick(({ delta_time }) => {
    // Update position
    x += vx * delta_time;
    y += vy * delta_time;

    // Bounce off horizontal walls
    if (x + (mask_radius * 2) >= CANVAS_WIDTH || x <= 0) {
      vx *= -1;
      x = x + (mask_radius * 2) >= CANVAS_WIDTH ? CANVAS_WIDTH - (mask_radius * 2) : 0;
    }

    // Bounce off vertical walls
    if (y + (mask_radius * 2) >= CANVAS_HEIGHT || y <= 0) {
      vy *= -1;
      y = y + (mask_radius * 2) >= CANVAS_HEIGHT ? CANVAS_HEIGHT - (mask_radius * 2) : 0;
    }

    // draw
    kl.clear_background();

    // this texture won't not visible (expected) - performance reasons
    kl.draw_texture({ texture: "character_green_front", x: 100, y: 200 });

    kl.draw_scissor_mode(
      () => {
        // draw calls inside this function will be masked
        kl.draw_texture({
          texture: "sample_background",
          x: 0,
          y: 0,
        });
      },
      { x: x, y: y, texture: "texture_mask_blur" },
    );

    kl.draw_texture({ texture: "character_green_front", x: 500, y: 200 });
  });
}
