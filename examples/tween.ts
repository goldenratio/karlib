import { Mutable } from "@goldenratio/core-utils";
import { BrowserEnv, BrowserTicker, DrawTextureOptions, Karlib, Tween } from "../src/main.js";

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

export async function main(canvas: HTMLCanvasElement): Promise<void> {
  const kl = new Karlib({
    canvas,
    env: new BrowserEnv(),
  });

  await kl.load_texture("./character_green_front.png");

  let direction: number = 1;

  const tween_id = Symbol("1");
  const texture_options: Mutable<DrawTextureOptions> = {
    texture: "character_green_front",
    x: 100,
    y: 100,
  };

  const tween = new Tween();
  const ticker = new BrowserTicker();
  ticker.on_tick(({ delta_time }) => {
    tween.set_delta_time(delta_time);
    if (direction === 1) {
      texture_options.x = tween.to(tween_id, 100, 400, "easeOutCubic", 1000);
    } else {
      texture_options.x = tween.to(tween_id, 400, 100, "easeOutCubic", 1000);
    }

    if (tween.is_completed(tween_id)) {
      tween.clear(tween_id);
      direction *= -1;
    }

    // draw
    kl.clear_background("#000");
    kl.draw_texture(texture_options);
  });
}
