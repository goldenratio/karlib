import type { DeepMutable } from "@goldenratio/core-utils";
import { clamp } from "@goldenratio/core-utils";

import { BrowserEnv, BrowserTicker, Karlib } from "../src/main.js";
import type { Camera2D } from "../src/main.js";

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

export async function main(canvas: HTMLCanvasElement): Promise<void> {
  const kl = new Karlib({ canvas, env: new BrowserEnv() });

  await kl.load_texture("./character_beige_front@{dpr}x.png", {
    available_dpr_scales: [1, 2],
    alias: "character_beige_front",
  });

  // Movement tuning
  const BASE_SPEED = 10;
  const SPRINT_MULT = 1.8;

  // --- World & Hero ----------------------------------------------------------
  const world_width = CANVAS_WIDTH * 2;
  const world_height = CANVAS_HEIGHT * 2;
  const keys_down = new Set<string>();

  let hero_x = 100;
  let hero_y = 100;

  // Track keyboard state
  window.addEventListener("keydown", (e) => keys_down.add(e.key));
  window.addEventListener("keyup", (e) => keys_down.delete(e.key));

  // --- Camera ---------------------------------------------------------------
  const camera: DeepMutable<Camera2D> = {
    offset: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 }, // center hero on screen
    rotation: 0,
    target: { x: hero_x, y: hero_y },
    zoom: 1,
  };

  function clamp_camera_to_world(cam: DeepMutable<Camera2D>) {
    const half_view_w = CANVAS_WIDTH / (2 * cam.zoom);
    const half_view_h = CANVAS_HEIGHT / (2 * cam.zoom);

    // If world is smaller than view, keep center in the middle of the world
    if (world_width <= 2 * half_view_w) {
      cam.target.x = world_width / 2;
    } else {
      cam.target.x = clamp(cam.target.x, half_view_w, world_width - half_view_w);
    }

    if (world_height <= 2 * half_view_h) {
      cam.target.y = world_height / 2;
    } else {
      cam.target.y = clamp(cam.target.y, half_view_h, world_height - half_view_h);
    }
  }

  // --- Ticker ---------------------------------------------------------------
  const ticker = new BrowserTicker();

  ticker.on_tick(ticker_data => {
    const dt = ticker_data.delta_time;

    // --- INPUT → MOVEMENT ----------------------------------------------------
    let dx = 0, dy = 0;

    // WASD
    if (keys_down.has("w") || keys_down.has("ArrowUp")) dy -= 1;
    if (keys_down.has("s") || keys_down.has("ArrowDown")) dy += 1;
    if (keys_down.has("a") || keys_down.has("ArrowLeft")) dx -= 1;
    if (keys_down.has("d") || keys_down.has("ArrowRight")) dx += 1;

    // normalize diagonal so speed is consistent
    if (dx !== 0 || dy !== 0) {
      const len = Math.hypot(dx, dy);
      dx /= len;
      dy /= len;
    }

    const is_sprint = keys_down.has("Shift");
    const speed = BASE_SPEED * (is_sprint ? SPRINT_MULT : 1);

    hero_x += dx * speed * dt;
    hero_y += dy * speed * dt;

    // Keep hero inside the world
    hero_x = clamp(hero_x, 0, world_width - 128); // 128 is width of hero texture
    hero_y = clamp(hero_y, 0, world_height - 128);

    // --- CAMERA FOLLOW -------------------------------------------------------
    camera.target.x = hero_x;
    camera.target.y = hero_y;
    clamp_camera_to_world(camera);

    // --- DRAW ----------------------------------------------------------------
    kl.clear_background("#000");

    kl.draw_mode_2d(() => {
      // World border
      kl.draw_rectangle({
        width: world_width,
        height: world_height,
        outline_size: 1,
        outline_style: "#ccc",
        fill_style: "rgba(0,0,0,0)",
      });

      // Grid
      for (let i = 0; i < world_width; i += 100) {
        kl.draw_line({ start: { x: i, y: 0 }, end: { x: i, y: world_height }, fill_style: "#ccc" });
      }
      for (let i = 0; i < world_height; i += 100) {
        kl.draw_line({ start: { x: 0, y: i }, end: { x: world_width, y: i }, fill_style: "#ccc" });
      }

      // Draw Hero
      kl.draw_texture({
        texture: "character_beige_front",
        x: hero_x,
        y: hero_y,
      });
    }, camera);
  });
}
