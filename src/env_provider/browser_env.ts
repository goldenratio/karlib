import type { EnvProvider } from "./env_provider.js";

export class BrowserEnv implements EnvProvider {
  constructor() {
    // empty
  }

  create_canvas(width: number, height: number): OffscreenCanvas {
    return new OffscreenCanvas(width, height)
  }

  create_image_from_canvas(canvas: OffscreenCanvas): ImageBitmap {
    return canvas.transferToImageBitmap();
  }

  load_image(url: string): Promise<ImageBitmap | undefined> {
    return new Promise(async (resolve) => {
      try {
        const blob = await fetch(url).then(r => r.blob());
        const bitmap = await createImageBitmap(blob);
        resolve(bitmap);
      } catch (err) {
        resolve(undefined);
      }
    });
  }

  create_dom_matrix(value?: number[]): DOMMatrix {
    return new DOMMatrix(value);
  }
}
