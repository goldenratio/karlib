import { BrowserEnv, BrowserTicker, Karlib } from "../src/main.js";

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

// Texture Packer spritesheet example
export async function main(canvas: HTMLCanvasElement): Promise<void> {

  const kl = new Karlib({
    env: new BrowserEnv({ canvas }),
    // set this to `true` for pixel art style games
    pixel_perfect: true,
  });

  await kl.load_spritesheet_tp("./spritesheet.json");

  const ticker = new BrowserTicker();
  ticker.on_tick(() => {
    kl.clear_background("#000");

    kl.draw_texture({
      texture: "hero-ship",
      x: 100,
      y: 100,
      scale: 2
    });

    kl.draw_texture({
      texture: "ship-2",
      x: 300,
      y: 300,
      scale: 2
    });

    kl.draw_texture({
      texture: "meteor-3",
      x: 500,
      y: 100,
      scale: 2
    });

  });
}
