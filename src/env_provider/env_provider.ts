import type { FixedLenArray, LoadImageOptions, ScaleMode } from "../types.js";

export interface EnvProvider {
  create_canvas(width: number, height: number): OffscreenCanvas;
  create_image_from_canvas(canvas: unknown): ImageBitmap;
  load_image(url: string, options?: LoadImageOptions): Promise<ImageBitmap | undefined>;
  load_json<TResponse>(url: string): Promise<TResponse | undefined>;
  create_dom_matrix(value?: FixedLenArray<number, 6> | FixedLenArray<number, 16>): DOMMatrix;
}
