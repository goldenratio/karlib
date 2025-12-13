import type { SCALE_MODE } from "../constants.js";
import type { EnvProvider } from "../env_provider/env_provider.js";
import type { Texture } from "../texture.js";

export type FillStyle = string | CanvasGradient | CanvasPattern;
export type OutlineStyle = string | CanvasGradient | CanvasPattern;

export interface Point {
  readonly x: number;
  readonly y: number;
}

export interface Rectangle {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface Size {
  readonly width: number;
  readonly height: number;
}

export interface InitOptions {
  readonly canvas: HTMLCanvasElement | OffscreenCanvas;
  readonly env: EnvProvider;
  /**
   * set this to true for transparent background
   * Warning: browsers may not target GPU for rendering, when background is set to transparent.
   * This will cause low performance.
   * @default false
   */
  readonly transparent_background?: boolean;
  /**
   * set this to true for pixel art games
   * @default false
   */
  readonly pixel_perfect?: boolean;
}

export interface DrawLineOptions {
  readonly start: Point;
  readonly end: Point;
  readonly fill_style: FillStyle;
  readonly thickness?: number;
  /**
   * @default "butt"
   */
  readonly line_cap?: CanvasLineCap;
  readonly alpha?: number;
  /**
   * @default 'source-over'
   */
  readonly blend_mode?: GlobalCompositeOperation;
}

export interface DrawRectangleOptions {
  readonly width: number;
  readonly height: number;
  readonly x?: number;
  readonly y?: number;
  readonly fill_style?: FillStyle;
  readonly outline_size?: number;
  readonly outline_cap?: CanvasLineCap;
  /**
   * @default "butt"
   */
  readonly outline_style?: OutlineStyle;
  /**
   * in degrees
   */
  readonly rotate?: number;
  readonly pivot?: Point;
  readonly scale?: number | Point;
  readonly alpha?: number;
  /**
   * @default 'source-over'
   */
  readonly blend_mode?: GlobalCompositeOperation;
}

export interface DrawCircleOptions {
  readonly radius: number;
  readonly x?: number;
  readonly y?: number;
  readonly fill_style?: FillStyle;
  readonly outline_size?: number;
  readonly outline_style?: OutlineStyle;
  readonly pivot?: Point;
  readonly scale?: number | Point;
  readonly alpha?: number;
  /**
   * @default 'source-over'
   */
  readonly blend_mode?: GlobalCompositeOperation;
}

export interface DrawTextureOptions {
  readonly texture: Texture | string;
  readonly x?: number;
  readonly y?: number;
  readonly width?: number;
  readonly height?: number;
  /**
   * in degrees
   */
  readonly rotate?: number;
  readonly pivot?: Point;
  readonly scale?: number | Point;
  /**
   * value between 0 to 1
   */
  readonly alpha?: number;
  readonly tint_color?: string;
  readonly tint_alpha?: number;
  readonly source_rect?: Rectangle;
  /**
   * @default 'source-over'
   */
  readonly blend_mode?: GlobalCompositeOperation;
}

export interface DrawTextureTileOptions {
  readonly texture: Texture | string;
  readonly x?: number;
  readonly y?: number;
  readonly width: number;
  readonly height: number;
  readonly tile_position_x?: number;
  readonly tile_position_y?: number;
  /**
   * in degrees
   */
  readonly tile_rotate?: number;
  readonly tile_scale?: number | Point;
  readonly tile_alpha?: number;
  /**
   * @default 'source-over'
   */
  readonly blend_mode?: GlobalCompositeOperation;
}

export interface DrawNineSliceTextureOptions {
  readonly texture: Texture | string;
  readonly x?: number;
  readonly y?: number;
  readonly left_width: number;
  readonly right_width: number;
  readonly top_height: number;
  readonly bottom_height: number;
  readonly width: number;
  readonly height: number;
  readonly alpha?: number;
  readonly pivot?: Point;
  /**
   * @default 'source-over'
   */
  readonly blend_mode?: GlobalCompositeOperation;
}

export interface LoadTextureOptions {
  /**
   * Scales image to the given value, when loading
   * Can be useful, If you want to pre-scale the image, so you don't need to scale in game loop
   */
  readonly pre_scale?: number;
  readonly scale_mode?: ScaleMode;
  readonly available_dpr_scales?: readonly number[];
  /**
   * Texture name alias
   */
  readonly alias?: string;
}

export type SpriteSheetLoadTextureOptions = Omit<LoadTextureOptions, "alias">;

export type ScaleMode = typeof SCALE_MODE[keyof typeof SCALE_MODE];

export type MaskSource =
  // circle
  | { readonly x: number; readonly y: number; readonly radius: number; readonly pivot?: Point; }
  // rect and rounded rect
  | { readonly x: number; readonly y: number; readonly width: number; readonly height: number; readonly radii?: number; }
  // path2D
  | { readonly path: Path2D, readonly fill_rule?: CanvasFillRule; }
  // texture
  | {
    readonly x: number;
    readonly y: number;
    readonly texture: Texture | string;
    readonly pivot?: Point;
    readonly scale?: number | Point;
  };

export interface Camera2D {
  readonly offset: Point,
  readonly target: Point,
  /**
   * in degrees
   */
  readonly rotation: number,
  readonly zoom: number,
}
