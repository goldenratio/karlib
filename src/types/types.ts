import type { SCALE_MODE } from "../constants.js";
import type { EnvProvider } from "../env_provider/env_provider.js";
import type { Texture } from "../texture.js";

export type FixedLenArray<T, L extends number> = T[] & { length: L };

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
   * @default 'round'
   */
  readonly lineCap?: CanvasLineCap;
}

export interface DrawRectangleOptions {
  readonly width: number;
  readonly height: number;
  readonly x?: number;
  readonly y?: number;
  readonly fill_style?: FillStyle;
  readonly outline_size?: number;
  readonly outline_style?: OutlineStyle;
  // in degrees
  readonly rotate?: number;
  readonly pivot?: Point;
  readonly scale?: number | Point;
  readonly alpha?: number;
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
}

export interface DrawTextureOptions {
  readonly texture: Texture | string;
  readonly x?: number;
  readonly y?: number;
  readonly width?: number;
  readonly height?: number;
  // in degrees
  readonly rotate?: number;
  readonly pivot?: Point;
  readonly scale?: number | Point;
  readonly alpha?: number;
  readonly tint_color?: string;
  readonly tint_alpha?: number;
  readonly source_rect?: Rectangle;
}

export interface DrawTextureTileOptions {
  readonly texture: Texture | string;
  readonly x?: number;
  readonly y?: number;
  readonly width: number;
  readonly height: number;
  readonly tile_position_x?: number;
  readonly tile_position_y?: number;
  // in degrees
  readonly tile_rotate?: number;
  readonly tile_scale?: number | Point;
  readonly tile_alpha?: number;
}

export type Mutable<T> = {
  -readonly [P in keyof T]: T[P] extends ReadonlyArray<infer U> ? U[] : T[P];
};

export interface EventEmitterLike {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addEventListener(event: any, listener: any, options?: any): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  removeEventListener(event: any, listener: any, options?: any): void;
}

export interface EventEmitterOnOffLike {
  on(event: string | symbol, listener: Function): this;
  off(event: string | symbol, listener?: Function): this;
}

export interface LoadImageOptions {
  readonly scale?: number;
  readonly scale_mode?: ScaleMode;
}

export type ScaleMode = typeof SCALE_MODE[keyof typeof SCALE_MODE];
