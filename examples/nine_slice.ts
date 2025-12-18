import { BrowserEnv, BrowserTicker, Karlib } from "../src/main.js";

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

export async function main(canvas: HTMLCanvasElement): Promise<void> {
  const kl = new Karlib({
    canvas: canvas,
    env: new BrowserEnv(),
  });

  await kl.load_texture("./button_square_flat.png");

  let direction = 1;
  let width = 100;
  let height = 100;

  const ticker = new BrowserTicker();
  ticker.on_tick(({ delta_time }) => {
    kl.clear_background("#000");

    kl.draw_nine_slice_texture({
      texture: "button_square_flat",
      x: 200,
      y: 200,
      width: width,
      height: height,
      left_width: 15,
      right_width: 15,
      top_height: 15,
      bottom_height: 15,
      // pivot: { x: 0.5, y: 0.5 }
    });

    width += delta_time * direction;
    height += delta_time * direction;
    if (width > 400 || width < 100) {
      direction *= -1;
    } else if (height > 300 || height < 100) {
      direction *= -1;
    }
  });
}
