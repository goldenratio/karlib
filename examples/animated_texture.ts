import { AnimatedTexture, BrowserEnv, BrowserTicker, Karlib } from "../src";

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

// Loading texture based on device pixel ratio (dpr)
export async function main(canvas: HTMLCanvasElement): Promise<void> {

  const kl = new Karlib({
    canvas: canvas,
    env: new BrowserEnv(),
  });

  for (let i = 0; i < 10; i++) {
    const idx = `${i}`.padStart(3, "0");
    await kl.load_texture(`./run__${idx}.png`);
  }

  const anim = new AnimatedTexture(kl, {
    frames: [
      "run__000",
      "run__001",
      "run__002",
      "run__003",
      "run__004",
      "run__005",
      "run__006",
      "run__007",
      "run__008",
      "run__009",
    ],
    frame_duration: 60,
  });

  const ticker = new BrowserTicker();
  ticker.on_tick(ticker_data => {
    kl.clear_background("#000");

    anim.update(ticker_data.elapsed_ms);
    anim.draw();
  });
}
