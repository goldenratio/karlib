import { BrowserTicker, type Karlib } from "../src";

export async function main(kl: Karlib, canvas: HTMLCanvasElement): Promise<void> {

  let x = 0;
  const ticker = new BrowserTicker();

  ticker.on_tick((delta) => {
    kl.clear_background("#000");
    kl.draw_rectangle({
      x: x,
      y: 100,
      width: 100,
      height: 100,
    });

    x += 10 * delta;
  });
}
