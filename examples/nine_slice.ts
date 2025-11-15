import { BrowserEnv, BrowserTicker, Karlib } from "../src";

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

export async function main(canvas: HTMLCanvasElement): Promise<void> {
  const kl = new Karlib({
    canvas: canvas,
    env: new BrowserEnv(),
  });

  await kl.load_texture('./button_square_flat.png');

  let direction = 1;
  let width = 100;
  let height = 100;

  const ticker = new BrowserTicker();
  ticker.on_tick(ticker_data => {
    kl.clear_background("#000");

    kl.draw_nine_slice_texture({
      texture: "button_square_flat",
      x: 10,
      y: 10,
      width: width | 0, // no decimal
      height: height | 0, // no decimal
      left_width: 15,
      right_width: 15,
      top_height: 15,
      bottom_height: 15,
    });

    width += ticker_data.delta_time * direction;
    height += ticker_data.delta_time * direction;
    if (width > 400 || width < 100) {
      direction *= -1;
    } else if (height > 300 || height < 100) {
      direction *= -1;
    }
  });
}
