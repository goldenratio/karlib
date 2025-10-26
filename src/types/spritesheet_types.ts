export interface SpriteSheetData {
  readonly frames: Record<string, FrameData>;
  readonly meta: Meta;
}

export interface FrameData {
  readonly frame: Frame;
}

export interface Frame {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

export interface Meta {
  readonly image: string;
  /**
   * @default 1
   */
  readonly scale?: number;
}
