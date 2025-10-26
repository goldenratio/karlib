import { Texture } from "./texture.js";
import { unwrap } from "./assert_utils.js";
import type { EnvProvider } from "./env_provider/env_provider.js";
import { SCALE_MODE } from "./constants.js";
import type { LoadTextureOptions, ScaleMode, SpriteSheetData, SpriteSheetLoadTextureOptions } from "./types/index.js";

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

    const smooth_texture = scale_mode === SCALE_MODE.Linear;
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
      const reset_transform: DOMMatrix2DInit = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
      cache_data.setTransform(reset_transform);
      return cache_data;
    }

    const repetition = "repeat";
    const img_src = source.get_src();
    let pattern: CanvasPattern | undefined = undefined;

    try {
      pattern = this.ctx.createPattern(img_src, repetition) ?? undefined;
    } catch (err) {
      if (err instanceof TypeError) {
        // TODO: REMOVE, when safari 16.x is no longer supported
        // iOS safari 16.x, doesn't support ImageBitmap in createPattern method
        // Apple still doesn't fix this shit.
        // fallback impl
        pattern = this.create_canvas_pattern_from_canvas(source, repetition);
      }
    }

    if (pattern) {
      this.canvas_pattern_cache.set(cache_key, pattern);
    }
    return pattern ?? undefined;
  }

  private create_canvas_pattern_from_canvas(source: Texture, repetition: string): CanvasPattern | undefined {
    const img_src = source.get_src();
    const temp_canvas = this.env.create_canvas(img_src.width, img_src.height);
    const temp_context2d = temp_canvas.getContext("2d");
    if (temp_context2d) {
      const scale_mode = source.get_scale_mode();
      const smooth_texture = scale_mode === SCALE_MODE.Linear;
      temp_context2d.imageSmoothingEnabled = smooth_texture;
      temp_context2d.drawImage(img_src, 0, 0);
      return this.ctx.createPattern(temp_canvas, repetition) ?? undefined;
    }
    return undefined;
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
  json_file: string | SpriteSheetData,
  options: SpriteSheetLoadTextureOptions,
  env: EnvProvider,
): Promise<Map<string, Texture>> {
  const result: Map<string, Texture> = new Map();
  let json_data: SpriteSheetData | undefined = undefined;

  if (typeof json_file === "string") {
    json_data = await env.load_json<SpriteSheetData>(json_file);
  } else {
    json_data = json_file;
  }

  if (!json_data) {
    return result;
  }

  const png_file_path = json_data["meta"]["image"];
  const src_img_data = typeof png_file_path === "string" ? await env.load_image(png_file_path) : undefined;
  if (!src_img_data) {
    return result;
  }

  const canvas = env.create_canvas(100, 100);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return result;
  }

  const { scale_mode, pre_scale = 1 } = options;
  const texture_scale = json_data["meta"]["scale"] ?? 1;
  const scale = typeof texture_scale === "number" ? pre_scale / texture_scale : pre_scale;

  const smooth_texture = scale_mode === SCALE_MODE.Linear;

  // NOTE: use bracket notation, instead of dot when accessing from `json_data`,
  // it ensures minifiers doesn't mangle it
  for (let frame_name in json_data["frames"]) {
    const data = json_data["frames"][frame_name]["frame"];
    canvas.width = Math.round(data["w"] * scale);
    canvas.height = Math.round(data["h"] * scale);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = smooth_texture;
    ctx.drawImage(
      src_img_data,
      data["x"], data["y"], data["w"], data["h"], // source
      0, 0, canvas.width, canvas.height // destination
    );

    const cropped_image = env.create_image_from_canvas(canvas);
    const texture = new Texture(cropped_image, canvas.width, canvas.height, scale_mode);
    result.set(frame_name, texture);
  }
  // in skia-canvas close function doesn't exist
  src_img_data.close?.();
  return result;
}

function find_nearest(arr: readonly number[], target: number): number {
  return arr.reduce((prev, curr) =>
    Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev
  );
}

export function get_dpr_resource_file_path(image_file_path: string, env: EnvProvider, available_dpr_scales?: readonly number[]): { readonly res_url: string; readonly res_dpr_scale?: number } {
  const dpr_token = "{dpr}";
  const dpr = env.get_device_pixel_ratio();
  let res_dpr_scale: number | undefined = undefined;

  if (available_dpr_scales && available_dpr_scales.length > 0 && image_file_path.includes(dpr_token)) {
    res_dpr_scale = find_nearest(available_dpr_scales, dpr);
  };
  const updated_image_file_path = typeof res_dpr_scale === "number" ? image_file_path.replaceAll(dpr_token, res_dpr_scale.toString()) : image_file_path;
  return { res_url: updated_image_file_path, res_dpr_scale };
}
