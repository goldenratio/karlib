import { Texture } from "./texture.js";
import { unwrap } from "./assert_utils.js";
import { EnvProvider } from "./env_provider/env_provider.js";
import { ScaleMode } from "./types.js";

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
    if (scale_mode === ScaleMode.Nearest) {
      this.ctx.imageSmoothingEnabled = false;
    }
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
