export interface SpriteSheetData {
  readonly frames: Record<string, FrameData>;
  readonly meta: Meta;
}

interface FrameData {
  readonly frame: Frame;
}

interface Frame {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

interface Meta {
  readonly app: string;
  readonly version: string;
  readonly image: string;
  readonly format: string;
  readonly size: Size;
  readonly scale: string;
}

interface Size {
  readonly w: number;
  readonly h: number;
}
