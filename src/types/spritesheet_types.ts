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
  readonly image: string;
  /**
   * @default 1
   */
  readonly scale?: number;
}

interface Size {
  readonly w: number;
  readonly h: number;
}
