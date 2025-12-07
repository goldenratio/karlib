import type { FixedLenArray } from "@goldenratio/core-utils";

import type { LoadTextureOptions } from "../types/index.js";

export interface EnvProvider {
  /**
   * Create a new offscreen canvas.
   */
  create_canvas(width: number, height: number): OffscreenCanvas;

  /**
   * Create an `ImageBitmap` from a canvas-like source.
   */
  create_image_from_canvas(canvas: unknown): ImageBitmap;

  /**
   * Load an image from a URL as an `ImageBitmap`.
   */
  load_image(url: string, options?: LoadTextureOptions): Promise<ImageBitmap | undefined>;

  /**
   * Load JSON data from a URL.
   */
  load_json<TData>(url: string): Promise<TData | undefined>;

  /**
   * Create a `DOMMatrix` from a 2D or 4×4 fixed-length array.
   */
  create_dom_matrix(value?: FixedLenArray<number, 6> | FixedLenArray<number, 16>): DOMMatrix;

  /**
   * Retrieve the device pixel ratio for the current environment.
   * Returns integer, fallbacks to 1
   */
  get_device_pixel_ratio(): number;
}
