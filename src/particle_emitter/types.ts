import type { Point } from "../types.js";

/**
 * Emitter Config is based on pixi-particle
 * https://github.com/pixijs-userland/particle-emitter
 */
export interface EmitterConfig {
  /**
   * Default position to spawn particles from inside the parent container.
   */
  readonly pos: Point;
  /**
   * Random number configuration for picking the lifetime for each particle..
   */
  readonly lifetime: EmitterRandNumber;
  /**
   * How often to spawn particles. This is a value in seconds, so a value of 0.5 would be twice a second.
   */
  readonly frequency: number;
  /**
   * How many particles to spawn at once, each time that it is determined that particles should be spawned.
   * If omitted, only one particle will spawn at a time.
   */
  readonly particles_per_wave?: number;
  /**
   * How long to run the Emitter before it stops spawning particles. If omitted, runs forever (or until told to stop
   * manually).
   * @default -1
   */
  readonly emitter_lifetime?: number;
  /**
   * Maximum number of particles that can be alive at any given time for this emitter.
   * @default 20
   */
  readonly max_particles?: number;
  /**
   * If the emitter should start out emitting particles. If omitted, it will be treated as `true` and will emit particles
   * immediately.
   * @default true
   */
  readonly emit?: boolean;
  /**
   * The list of behaviors to apply to this emitter.
   */
  readonly behaviors: readonly BehaviorEntryType[];

  /**
   * Applied before drawing particles
   */
  readonly blend_mode?: GlobalCompositeOperation;
}

export interface EmitterConfigValue<TValue> {
  readonly time: number;
  readonly value: TValue;
}

export type BehaviorConfigOf<T extends BehaviorEntryType["type"]> =
  Extract<BehaviorEntryType, { type: T }>["config"];

type AnimFrame = {
  readonly textures: readonly string[];
  /**
   * in milliseconds
   * @default 100
   **/
  readonly frame_duration?: number;
  /**
   * @default true
   */
  readonly loop?: boolean;
}

export type BehaviorEntryType =
  // textures
  | { readonly type: "textureSingle"; readonly config: { readonly texture: string } }
  | { readonly type: "textureRandom"; readonly config: { readonly textures: readonly string[] } }
  | { readonly type: "animatedSingle"; readonly config: { readonly anim: AnimFrame } }
  | { readonly type: "animatedRandom"; readonly config: { readonly anims: AnimFrame[] } }
  // properties
  | { readonly type: "color"; readonly config: { readonly color: { readonly list: readonly EmitterConfigValue<string>[] } } }
  | { readonly type: "colorStatic"; readonly config: { readonly color: string } }
  | { readonly type: "scale"; readonly config: { readonly scale: { readonly list: readonly EmitterConfigValue<number>[] }; readonly min_mult: number } }
  | { readonly type: "scaleStatic"; readonly config: EmitterRandNumber }
  | { readonly type: "moveSpeed"; readonly config: { readonly speed: { readonly list: readonly EmitterConfigValue<number>[] }; readonly min_mult: number } }
  | { readonly type: "moveSpeedStatic"; readonly config: EmitterRandNumber }
  | { readonly type: "moveAcceleration"; readonly config: { readonly min_start: number; readonly max_start: number; readonly rotate: boolean; readonly accel: Point; readonly max_speed: number } }
  | { readonly type: "alpha"; readonly config: { readonly alpha: { readonly list: readonly EmitterConfigValue<number>[] } } }
  | { readonly type: "alphaStatic"; readonly config: { readonly alpha: number } }
  | { readonly type: "noRotation"; readonly config: {} }
  | { readonly type: "rotation"; readonly config: { readonly min_start: number; readonly max_start: number; readonly min_speed: number; readonly max_speed: number; readonly accel: number } }
  | { readonly type: "rotationStatic"; readonly config: EmitterRandNumber }
  // emitter configs
  | { readonly type: "spawnPoint"; readonly config: {} }
  | { readonly type: "spawnBurst"; readonly config: { readonly start: number; readonly spacing: number; } }
  | {
    readonly type: "spawnShape"; readonly config:
    | { readonly type: "rect"; readonly data: { readonly x: number; readonly y: number; readonly w: number; readonly h: number } }
    | { readonly type: "torus"; readonly data: { readonly x: number; readonly y: number; readonly radius: number; readonly inner_radius: number; readonly affect_rotation: boolean } };
  };

/**
 * Configuration for how to pick a random number (inclusive).
 */
export interface EmitterRandNumber {
  /**
   * Maximum pickable value.
   */
  readonly max: number;
  /**
   * Minimum pickable value.
   */
  readonly min: number;
}

