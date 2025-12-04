import { SCALE_MODE } from "../constants.js";
import type { LoadTextureOptions } from "../types/index.js";
import type { EnvProvider } from "./env_provider.js";

export class BrowserEnv implements EnvProvider {
  private readonly dpr: number;

  constructor() {
    this.dpr = Math.ceil(window.devicePixelRatio || 1);
  }

  get_device_pixel_ratio(): number {
    return this.dpr
  }

  create_canvas(width: number, height: number): OffscreenCanvas {
    return new OffscreenCanvas(width, height)
  }

  create_image_from_canvas(canvas: OffscreenCanvas): ImageBitmap {
    return canvas.transferToImageBitmap();
  }

  load_image(url: string, options?: LoadTextureOptions): Promise<ImageBitmap | undefined> {
    const { pre_scale = 1, scale_mode = SCALE_MODE.Linear } = options ?? {};
    return new Promise(async (resolve) => {
      try {
        const blob = await fetch(url).then(r => r.blob());
        const bitmap = await createImageBitmap(blob);
        if (pre_scale === 1) {
          resolve(bitmap);
          return;
        }

        const width = Math.round(bitmap.width * pre_scale);
        const height = Math.round(bitmap.height * pre_scale);

        const canvas = this.create_canvas(width, height);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(bitmap);
          return;
        }
        const smooth_texture = scale_mode === SCALE_MODE.Linear;
        ctx.imageSmoothingEnabled = smooth_texture;
        ctx.drawImage(bitmap, 0, 0, width, height);

        // cannot use createImageBitmap's resize option,
        // because it pixelates pixel art graphics when resized
        const scaledBitmap = await createImageBitmap(canvas);
        bitmap.close();

        resolve(scaledBitmap);
      } catch (err) {
        console.log(err);
        resolve(undefined);
      }
    });
  }

  load_json<TData>(url: string): Promise<TData> {
    return new Promise<TData>((resolve) => {
      fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error, status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => resolve(data));
      // NOTE: we don't catch error
      // caller handles network errors
    });
  }

  create_dom_matrix(value?: number[]): DOMMatrix {
    return new DOMMatrix(value);
  }
}
