import { unwrap } from "./assert_utils.js";
import { SCALE_MODE } from "./constants.js";
import type { Disposable } from "./dispose_bag.js";
import type { EnvProvider } from "./env_provider/env_provider.js";
import { to_radians } from "./math_utils.js";
import { Texture } from "./texture.js";
import {
  generate_textures_from_spritesheet_tp,
  get_dpr_resource_file_path,
  get_texture_name_from_file_path,
  TextureUtil
} from "./texture_utils.js";
import type {
  DrawCircleOptions, DrawLineOptions, DrawRectangleOptions,
  DrawTextureOptions, DrawTextureTileOptions, InitOptions,
  Size,
  LoadTextureOptions,
  SpriteSheetData,
  MaskSource
} from "./types/index.js";

export class Karlib implements Disposable {
  private readonly context2d: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
  private readonly canvas_size: Size;
  private readonly texture_util: TextureUtil;
  private readonly env: EnvProvider;
  private readonly res_textures = new Map<string, Texture>();
  private readonly pixel_perfect: boolean;
  private readonly transparent_background: boolean;

  constructor(options: InitOptions) {
    const { canvas, env, pixel_perfect = false, transparent_background = false } = options;
    this.pixel_perfect = pixel_perfect;
    this.transparent_background = transparent_background;
    this.env = env;
    this.canvas_size = { width: canvas.width, height: canvas.height };

    const ctx = unwrap(canvas.getContext('2d', {
      alpha: transparent_background,
      willReadFrequently: false,
    }), "Unable to get 2D rendering context");

    this.context2d = ctx as CanvasRenderingContext2D;
    this.texture_util = new TextureUtil(env);
  }

  private add_texture_cache(texture_name: string, texture: Texture): void {
    const existing_texture = this.res_textures.get(texture_name);
    if (existing_texture) {
      existing_texture.dispose();
    }
    this.res_textures.set(texture_name, texture);
  }

  /**
   * Loads image and converts it to texture.
   * If the image path contains token "{dpr}", then when loading the image,"{dpr}" value is replaced with device-pixel-ratio.
   */
  async load_texture(image_file_path: string, options?: LoadTextureOptions): Promise<Texture | undefined> {
    const scale_mode = this.pixel_perfect ? SCALE_MODE.Nearest : SCALE_MODE.Linear;
    const updated_options = { scale_mode, ...options };
    const { res_url: texture_url, res_dpr_scale: texture_dpr_scale = 1 } = get_dpr_resource_file_path(image_file_path, this.env, updated_options.available_dpr_scales);
    const img = await this.env.load_image(texture_url, updated_options);
    const texture = img ? new Texture(img, img.width, img.height, scale_mode, texture_dpr_scale) : undefined;
    if (texture) {
      const texture_name = get_texture_name_from_file_path(image_file_path);
      this.add_texture_cache(texture_name, texture);
    }
    return texture;
  }

  /**
   * Minimal support for TexturePacker exported spritesheet
   * Supports only JSON hash format
   * If the path contains token "{dpr}", then when loading the file, "{dpr}" value is replaced with device-pixel-ratio.
   */
  async load_spritesheet_tp(json_file_path: string | SpriteSheetData, options?: LoadTextureOptions): Promise<Map<string, Texture>> {
    const scale_mode = this.pixel_perfect ? SCALE_MODE.Nearest : SCALE_MODE.Linear;
    const updated_options = { scale_mode, ...options };
    let updated_json_file_path: string | SpriteSheetData = json_file_path;

    if (typeof json_file_path === "string") {
      const { res_url } = get_dpr_resource_file_path(json_file_path, this.env, updated_options.available_dpr_scales);
      updated_json_file_path = res_url;
    }

    const result = await generate_textures_from_spritesheet_tp(updated_json_file_path, updated_options, this.env);
    result.forEach((texture, texture_name) => {
      this.add_texture_cache(texture_name, texture);
    });
    return result;
  }

  /**
   * Sets background color
   */
  clear_background(color: string = "#000"): void {
    const ctx = this.context2d;
    ctx.save();
    if (!this.transparent_background) {
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, this.canvas_size.width, this.canvas_size.height);
    } else {
      ctx.clearRect(0, 0, this.canvas_size.width, this.canvas_size.height);
    }
    ctx.restore();
  }

  draw_line(options: DrawLineOptions): void {
    const { start, end, fill_style, thickness = 1, lineCap = "butt" } = options;

    const ctx = this.context2d;
    ctx.save();

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.lineWidth = thickness;
    ctx.strokeStyle = fill_style;
    ctx.lineCap = lineCap;
    ctx.stroke();

    ctx.restore();
  }

  draw_rectangle(options: DrawRectangleOptions): void {
    const {
      width, height,
      x = 0, y = 0, fill_style = "#ff0000",
      outline_size = 0, outline_style = "#ffffff",
      rotate = 0, pivot = { x: 0, y: 0 },
      scale = 1, alpha = 1,
    } = options;

    const ctx = this.context2d;

    const pivot_x = (pivot.x >= 0 && pivot.x <= 1) ? pivot.x * width : pivot.x;
    const pivot_y = (pivot.y >= 0 && pivot.y <= 1) ? pivot.y * height : pivot.y;

    const sx = typeof scale === "number" ? scale : scale.x;
    const sy = typeof scale === "number" ? scale : scale.y;

    if (sx === 0 || sy === 0 || alpha === 0) {
      return;
    }

    // Fast path: no rotation and pivot at top-left → keep your crisp stroke behavior
    const noRotation = rotate === 0 && pivot_x === 0 && pivot_y === 0;

    if (noRotation) {
      ctx.save();
      ctx.globalAlpha = ctx.globalAlpha * alpha;

      ctx.fillStyle = fill_style;
      ctx.fillRect(x, y, width, height);

      if (outline_size > 0) {
        ctx.lineWidth = outline_size;
        ctx.strokeStyle = outline_style;

        // Half-pixel alignment for odd line widths
        const align = (outline_size % 2 === 1) ? 0.5 : 0;
        ctx.strokeRect(align + x, align + y, width - 2 * align, height - 2 * align);
      }
      ctx.restore();
      return;
    }

    // General path: translate to world pivot, rotate, then draw rect offset by -pivot
    ctx.save();
    ctx.globalAlpha = ctx.globalAlpha * alpha;

    ctx.translate(x + pivot_x, y + pivot_y);
    if (sx !== 1 || sy !== 1) {
      ctx.scale(sx, sy);
    }

    ctx.rotate(to_radians(rotate));

    // Fill
    ctx.fillStyle = fill_style;
    ctx.fillRect(-pivot_x, -pivot_y, width, height);

    // Outline (can’t guarantee pixel-perfect crispness under rotation)
    if (outline_size > 0) {
      ctx.lineWidth = outline_size;
      ctx.strokeStyle = outline_style;
      ctx.strokeRect(-pivot_x, -pivot_y, width, height);
    }

    ctx.restore();
  }

  draw_circle(options: DrawCircleOptions): void {
    const {
      radius,
      x = 0, y = 0, fill_style = "#ff0000",
      outline_size = 0, outline_style = "#ffffff",
      pivot = { x: 0, y: 0 },
      scale = 1, alpha = 1,
    } = options;

    const ctx = this.context2d;

    // The circle’s bounding box is diameter x diameter
    const diameter = radius * 2;

    // If pivot supplied in [0..1], convert to pixels. Otherwise assume pixels.
    const pivot_x = (pivot.x >= 0 && pivot.x <= 1) ? pivot.x * diameter : pivot.x;
    const pivot_y = (pivot.y >= 0 && pivot.y <= 1) ? pivot.y * diameter : pivot.y;

    // Top-left of the bounding box = (x - pivot_x, y - pivot_y)
    // Circle center is top-left + (radius, radius)
    const cx = x - pivot_x + radius;
    const cy = y - pivot_y + radius;

    const sx = typeof scale === "number" ? scale : scale.x;
    const sy = typeof scale === "number" ? scale : scale.y;

    if (sx === 0 || sy === 0 || alpha === 0) {
      return;
    }

    ctx.save();
    ctx.globalAlpha = ctx.globalAlpha * alpha;

    if (sx !== 1 || sy !== 1) {
      ctx.scale(sx, sy);
    }

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
    ctx.fillStyle = fill_style;
    ctx.fill();

    if (outline_size > 0) {
      ctx.lineWidth = outline_size;
      ctx.strokeStyle = outline_style;
      ctx.stroke();
    }
    ctx.restore();
  }

  draw_texture(options: DrawTextureOptions): void {
    const {
      texture: texture_opt,
      x = 0, y = 0, rotate = 0, width, height,
      pivot = { x: 0, y: 0 }, scale = 1, alpha = 1,
      tint_color, tint_alpha = 1,
      source_rect,
    } = options;

    const texture = typeof texture_opt === 'string'
      ? unwrap(this.res_textures.get(texture_opt), `texture ${texture_opt} does not exist`)
      : texture_opt;

    const texture_dpr_scale = texture.get_dpr_scale();
    const ctx = this.context2d;

    const w = width ?? texture.get_width();
    const h = height ?? texture.get_height();

    // If pivot supplied in [0..1], convert to pixels. If >=1 (or negative), assume pixels.
    const pivot_x = (pivot.x >= 0 && pivot.x <= 1) ? pivot.x * w : pivot.x;
    const pivot_y = (pivot.y >= 0 && pivot.y <= 1) ? pivot.y * h : pivot.y;

    const sx = (typeof scale === "number" ? scale : scale.x) / texture_dpr_scale;
    const sy = (typeof scale === "number" ? scale : scale.y) / texture_dpr_scale;

    if (sx === 0 || sy === 0 || alpha === 0) {
      return;
    }

    ctx.save();
    ctx.globalAlpha = ctx.globalAlpha * alpha;
    ctx.translate(x, y);

    const smooth_texture = texture.get_scale_mode() === SCALE_MODE.Linear;
    ctx.imageSmoothingEnabled = smooth_texture;

    if (sx !== 1 || sy !== 1) {
      ctx.scale(sx, sy);
    }

    if (rotate > 0) {
      ctx.rotate(to_radians(rotate));
    }

    const image = typeof tint_color === "undefined"
      ? texture.get_src()
      : this.texture_util.get_tinted_texture(texture, tint_color, tint_alpha).get_src();

    if (typeof image !== "undefined") {
      if (typeof source_rect === "undefined") {
        ctx.drawImage(image, -pivot_x, -pivot_y, w, h);
      } else {
        const { x: sx, y: sy, width: sw, height: sh } = source_rect;
        ctx.drawImage(image, sx, sy, sw, sh, -pivot_x, -pivot_y, w, h)
      }
    }
    ctx.restore();
  }

  draw_texture_tile(options: DrawTextureTileOptions): void {
    const {
      texture: texture_opt,
      x = 0, y = 0, width, height,
      tile_position_x = 0, tile_position_y = 0,
      tile_scale, tile_rotate = 0, tile_alpha = 1,
    } = options;

    const texture = typeof texture_opt === 'string'
      ? unwrap(this.res_textures.get(texture_opt), `texture ${texture_opt} does not exist`)
      : texture_opt;

    const ctx = this.context2d;

    ctx.save();
    ctx.globalAlpha = ctx.globalAlpha * tile_alpha;
    ctx.translate(x, y);

    const smooth_texture = texture.get_scale_mode() === SCALE_MODE.Linear;
    ctx.imageSmoothingEnabled = smooth_texture;

    const pattern = this.texture_util.get_canvas_pattern(texture);
    if (!pattern) {
      ctx.restore();
      return;
    }

    let matrix: DOMMatrix | undefined = undefined;

    if (typeof tile_scale !== "undefined") {
      const sx = typeof tile_scale === "number" ? tile_scale : tile_scale.x;
      const sy = typeof tile_scale === "number" ? tile_scale : tile_scale.y;
      matrix = matrix ?? this.env.create_dom_matrix();
      matrix = matrix.scale(sx, sy);
    }

    if (tile_position_x !== 0 || tile_position_y !== 0) {
      matrix = matrix ?? this.env.create_dom_matrix();
      matrix = matrix.translate(tile_position_x, tile_position_y);
    }

    if (tile_rotate !== 0) {
      matrix = matrix ?? this.env.create_dom_matrix();
      matrix = matrix.rotate(tile_rotate); // degrees
    }

    if (matrix) {
      pattern.setTransform(matrix);
    }

    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, width, height);

    ctx.restore();
  }

  /**
   * Executes a drawing function with an clipping mask.
   * @param draw_fn mask is applied for any drawing done inside this function
   * @param mask_source when not defined mask is not applied. By setting it to undefined, you can use it to disable/enable mask
   */
  draw_scissor_mode(
    draw_fn: (kl: Karlib) => void,
    mask_source?: MaskSource,
  ): void {
    if (!mask_source) {
      draw_fn(this);
      return;
    }

    const ctx = this.context2d;
    ctx.save();

    if ("width" in mask_source) {
      ctx.beginPath();
      const { x, y, width, height, radii } = mask_source;
      if (typeof radii === "undefined") {
        ctx.rect(x, y, width, height);
      } else {
        ctx.roundRect(x, y, width, height, radii);
      }
      ctx.closePath();
      ctx.clip();
    } else if ("radius" in mask_source) {
      ctx.beginPath();
      const { x, y, radius, pivot = { x: 0, y: 0 } } = mask_source;
      const diameter = radius * 2;
      const pivot_x = (pivot.x >= 0 && pivot.x <= 1) ? pivot.x * diameter : pivot.x;
      const pivot_y = (pivot.y >= 0 && pivot.y <= 1) ? pivot.y * diameter : pivot.y;

      const cx = x - pivot_x + radius;
      const cy = y - pivot_y + radius;

      ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
      ctx.closePath();
      ctx.clip();
    } else if ("path" in mask_source) {
      const { path, fill_rule } = mask_source;
      ctx.clip(path, fill_rule);
    } else if ("texture" in mask_source) {
      const { x, y, texture, pivot, scale } = mask_source;
      const overlay_texture = typeof texture === "string"
        ? unwrap(this.res_textures.get(texture), `texture! ${texture} does not exist`)
        : texture;
      /**
       * NOTE: we have correctness issue with "destination-in" approach,
       * however it's the most performant way.
       * what's the issue?
       * Masking operation affects the entire canvas, not just the content drawn within the `draw_fn`.
       * So draw calls done before `draw_fn` will be lost.
       * I think, it's fine 99% of the use case.
       */
      draw_fn(this);
      ctx.globalCompositeOperation = "destination-in";
      this.draw_texture({ texture: overlay_texture, x, y, pivot, scale });
      ctx.restore();
      return;
    }

    draw_fn(this);
    ctx.restore();
  }

  get_context_2d(): CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D {
    return this.context2d;
  }

  get_canvas_width(): number {
    return this.canvas_size.width;
  }

  get_canvas_height(): number {
    return this.canvas_size.height;
  }

  get_tinted_texture(source: Texture, tint_color: string, tint_alpha: number): Texture {
    return this.texture_util.get_tinted_texture(source, tint_color, tint_alpha);
  }

  get_texture_from_name(name: string): Texture | undefined {
    return this.res_textures.get(name);
  }

  get_env(): EnvProvider {
    return this.env;
  }

  /**
   * Dispose the karlib instance.
   * Once dispose is called, the karlib instance should not be re-used
   */
  dispose(): void {
    this.texture_util.dispose();
    for (const texture of this.res_textures.values()) {
      texture.dispose();
    }
    this.res_textures.clear();

    // Break references for GC
    // @ts-expect-error intentional nulling out
    this.context2d = null;
  }
}
