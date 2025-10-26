import { BrowserEnv, BrowserTicker, Karlib } from "../src";

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

// Loading texture based on device pixel ratio (dpr)
export async function main(canvas: HTMLCanvasElement): Promise<void> {

  const kl = new Karlib({
    canvas: canvas,
    env: new BrowserEnv(),
  });

  await kl.load_texture("./character_beige_front@{dpr}x.png", { available_dpr_scales: [1, 2], alias: "character_beige_front" });

  const ticker = new BrowserTicker();
  ticker.on_tick(ticker_data => {
    kl.clear_background("#000");

    kl.draw_texture({
      texture: "character_beige_front",
      x: 100,
      y: 100,
    });

  });
}
