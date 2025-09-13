import { SCALE_MODE } from "./constants.js";
import type { ScaleMode } from "./types/index.js";

let id = 0;

export class Texture {
  private readonly src: ImageBitmap;
  private readonly width: number;
  private readonly height: number;
  private readonly id: string;

  private scale_mode: ScaleMode = SCALE_MODE.Linear;

  constructor(src: ImageBitmap, width: number, height: number, scale_mode: ScaleMode = SCALE_MODE.Linear) {
    this.src = src;
    this.width = width;
    this.height = height;
    this.scale_mode = scale_mode;
    id++;
    this.id = id.toString();
  }

  set_scale_mode(mode: ScaleMode): void {
    this.scale_mode = mode;
  }

  get_width(): number {
    return this.width;
  }

  get_height(): number {
    return this.height;
  }

  get_src(): ImageBitmap {
    return this.src;
  }

  get_id(): string {
    return this.id;
  }

  get_scale_mode(): ScaleMode {
    return this.scale_mode;
  }

  dispose(): void {
    this.src.close?.();
  }
}
