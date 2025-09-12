import { BrowserTicker, type Karlib } from "../src";

export async function main(kl: Karlib, canvas: HTMLCanvasElement): Promise<void> {
  const right = canvas.width;
  const bottom = canvas.height;
  const top = 0;
  const left = 0;
  const rect_width = 100;
  const rect_height = 100;

  let x = canvas.width / 2 - 50;
  let y = canvas.height / 2 - 50;
  let vx = Math.random() * 10 - 5;
  let vy = Math.random() * 10 - 5;

  const ticker = new BrowserTicker();

  ticker.on_tick((delta) => {
    // update
    x += vx * delta;
    y += vy * delta;

    if (x + rect_width >= right) {
      x = right - rect_width;
      vx *= -1;
    } else if (x <= left) {
      x = left;
      vx *= -1;
    }

    if (y + rect_height >= bottom) {
      y = bottom - rect_height;
      vy *= -1;
    } else if (y <= top) {
      y = top;
      vy *= -1;
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
