import { Texture } from "./texture.js";
import { unwrap } from "./assert_utils.js";
import type { EnvProvider } from "./env_provider/env_provider.js";
import { SCALE_MODE } from "./constants.js";
import type { LoadImageOptions, SpriteSheetData } from "./types/index.js";

export class TextureUtil {
  private readonly cache: Map<string, Texture> = new Map();
  private readonly canvas_pattern_cache: Map<string, CanvasPattern> = new Map();
  private readonly buffer: OffscreenCanvas;
  private readonly ctx: OffscreenCanvasRenderingContext2D;
  private readonly env: EnvProvider;

  constructor(env: EnvProvider) {
    this.env = env;
    this.buffer = env.create_canvas(100, 100);
    this.ctx = unwrap(
      this.buffer.getContext("2d"),
      "OffscreenCanvas context cannot be undefined!"
    );
  }

  get_tinted_texture(source: Texture, tint_color: string, tint_alpha: number): Texture {
    const cache_key = `${source.get_id()}-${tint_color}-${tint_alpha}`;
    const cache_data = this.cache.get(cache_key);
    if (cache_data) {
      return cache_data;
    }

    const scale_mode = source.get_scale_mode();
    const texture_src = source.get_src();
    this.buffer.width = source.get_width();
    this.buffer.height = source.get_height();

    // Clear the canvas to ensure no artifacts from previous operations.
    this.ctx.clearRect(0, 0, this.buffer.width, this.buffer.height);

    this.ctx.globalCompositeOperation = "source-over";
    this.ctx.fillStyle = tint_color;
    this.ctx.globalAlpha = tint_alpha;
    this.ctx.fillRect(0, 0, this.buffer.width, this.buffer.height);

    // Composite the texture.
    this.ctx.globalCompositeOperation = "destination-atop";
    this.ctx.globalAlpha = 1;

    const smooth_texture = scale_mode === "linear";
    this.ctx.imageSmoothingEnabled = smooth_texture;

    this.ctx.drawImage(texture_src, 0, 0);

    const image = this.env.create_image_from_canvas(this.buffer);
    const tinted_texture = new Texture(image, this.buffer.width, this.buffer.height);
    this.cache.set(cache_key, tinted_texture);
    return tinted_texture;
  }

  get_canvas_pattern(source: Texture): CanvasPattern | undefined {
    const cache_key = `${source.get_id()}`;
    const cache_data = this.canvas_pattern_cache.get(cache_key);
    if (cache_data) {
      // setting null fails in skia-canvas
      cache_data.setTransform({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 });
      return cache_data;
    }

    const pattern = this.ctx.createPattern(source.get_src(), "repeat");
    if (pattern) {
      this.canvas_pattern_cache.set(cache_key, pattern);
    }
    return pattern ?? undefined;
  }

  dispose(): void {
    for (const texture of this.cache.values()) {
      texture.dispose();
    }
    this.cache.clear();
    this.canvas_pattern_cache.clear();
  }
}

export function get_texture_name_from_file_path(file_path: string): string {
  const file_name = file_path.substring(file_path.lastIndexOf("/") + 1);
  const clean_file_name = file_name.split(/[?#]/)[0];
  const name_without_ext = clean_file_name.replace(/\.[^/.]+$/, "");
  return name_without_ext;
}

export async function generate_textures_from_spritesheet_tp(
  json_file: string,
  options: LoadImageOptions,
  env: EnvProvider
): Promise<Map<string, Texture>> {
  const result: Map<string, Texture> = new Map();
  const json_data = await env.load_json<SpriteSheetData>(json_file);
  if (!json_data) {
    return result;
  }

  const png_file_path = json_data.meta.image;
  const src_img_data = await env.load_image(png_file_path);
  if (!src_img_data) {
    return result;
  }

  const canvas = env.create_canvas(100, 100);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return result;
  }

  const { scale = 1, scale_mode = SCALE_MODE.Linear } = options;
  const smooth_texture = scale_mode === SCALE_MODE.Linear;

  for (let frame_name in json_data.frames) {
    const data = json_data.frames[frame_name].frame;
    canvas.width = Math.round(data.w * scale);
    canvas.height = Math.round(data.h * scale);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = smooth_texture;
    ctx.drawImage(
      src_img_data,
      data.x, data.y, data.w, data.h, // source
      0, 0, canvas.width, canvas.height // destination
    );

    const cropped_image = env.create_image_from_canvas(canvas);
    const texture = new Texture(cropped_image, canvas.width, canvas.height, scale_mode);
    result.set(frame_name, texture);
  }
  src_img_data.close();
  return result;
}
