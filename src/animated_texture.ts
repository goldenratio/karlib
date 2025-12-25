import type { Disposable } from "@goldenratio/core-utils";
import { unwrap } from "@goldenratio/core-utils";

import type { Karlib } from "./karlib.js";
import type { Texture } from "./texture.js";
import type { DrawTextureOptions } from "./types/types.js";

export interface AnimatedTextureOptions {
  /**
   * Ordered frames for the animation.
   */
  readonly frames: readonly Texture[] | readonly string[];

  /**
   * @default 0
   */
  readonly start_frame_index?: number;

  /**
   * Default per-frame duration (in milliseconds)
   * @default 100
   */
  readonly frame_duration?: number;

  /**
   * Number of times to loop. Use Infinity for infinite loop.
   * @default Infinity
   */
  readonly loop?: number;

  /**
   * If true, play A->B->A (ping-pong).
   * @default false
   */
  readonly ping_pong?: boolean;

  /**
   * Global playback speed multiplier.
   * @default 1
   */
  readonly speed?: number;

  /**
   * Start in playing state.
   * @default true
   */
  readonly autoplay?: boolean;
}

export type DrawAnimatedTextureOptions = Omit<DrawTextureOptions, "texture">;

export class AnimatedTexture implements Disposable {
  private readonly kl: Karlib;

  private readonly frames: Texture[];
  private readonly frame_duration: number;
  private readonly ping_pong: boolean;
  private speed: number;

  private playing = true;
  private idx = 0; // current frame index
  private dir: 1 | -1 = 1; // used when ping-pong is enabled
  private acc = 0; // accumulated ms
  private loops_remaining: number; // remaining loop count

  private animation_complete_callback?: () => void = undefined;

  constructor(kl: Karlib, options: AnimatedTextureOptions) {
    this.kl = kl;
    const {
      frames,
      frame_duration = 100,
      start_frame_index = 0,
      ping_pong = false,
      loop = Infinity,
      speed = 1,
      autoplay = true,
    } = options;

    this.frames = frames.map(f => {
      if (typeof f === "string") {
        return unwrap(kl.get_texture_from_name(f), `cannot find texture: ${f}`);
      }
      return f;
    });
    this.frame_duration = frame_duration;
    this.ping_pong = ping_pong;
    this.speed = Math.max(0, speed);

    this.loops_remaining = loop === Infinity ? Infinity : Math.max(0, loop | 0);
    this.playing = autoplay;
    this.idx = Math.max(0, Math.min(this.frames.length - 1, (start_frame_index | 0)));
  }

  get_current_frame_index(): number {
    return this.idx;
  }

  set_speed(value: number): void {
    this.speed = Math.max(0, value);
  }

  set_on_animation_complete(fn: () => void): void {
    this.animation_complete_callback = fn;
  }

  dispose(): void {
    this.stop();
    this.frames.length = 0;
    this.animation_complete_callback = undefined;
  }

  stop(): void {
    this.playing = false;
    this.idx = 0;
    this.dir = 1;
    this.acc = 0;
  }

  play(): void {
    this.playing = true;
  }

  pause(): void {
    this.playing = false;
  }

  /**
   * Jump to the given frame index, clamped to [0, length-1].
   */
  goto_frame(frame_index: number): void {
    if (this.frames.length === 0) {
      return;
    }
    this.idx = Math.max(0, Math.min(this.frames.length - 1, (frame_index | 0)));
    this.acc = 0;
  }

  /**
   * Update loop
   * @param delta_time Scalar representing the delta time factor (value between 0 to 1)
   */
  update(delta_time: number): void {
    if (!this.playing || this.frames.length <= 1 || delta_time <= 0 || this.speed === 0) {
      return;
    }

    // this.acc += elapsed_ms * this.speed;

    // Accumulate elapsed milliseconds scaled by global speed multiplier
    const elapsed_ms = delta_time * 16.66; // (1000 / 60);
    this.acc += elapsed_ms * this.speed;

    const frame_duration = this.frame_duration;

    if (this.acc >= frame_duration) {
      const frames_to_advance = Math.floor(this.acc / frame_duration);
      this.acc %= frame_duration; // carry leftover time
      this.advance_index_by(frames_to_advance);
    }
  }

  /**
   * Draw
   */
  draw(options?: DrawAnimatedTextureOptions): void {
    if (this.frames.length === 0) {
      return;
    }
    const texture = this.frames[this.idx];
    if (texture) {
      const texture_options: DrawTextureOptions = { ...options, texture };
      this.kl.draw_texture(texture_options);
    }
  }

  private animation_complete(): void {
    this.animation_complete_callback?.();
  }

  private advance_index_by(steps: number): void {
    for (let i = 0; i < steps; i++) {
      this.advance_index();
      if (!this.playing) {
        break;
      }
    }
  }

  private advance_index(): void {
    if (!this.ping_pong) {
      if (this.idx + 1 < this.frames.length) {
        this.idx += 1;
      } else {
        if (this.loops_remaining === Infinity || this.loops_remaining > 1) {
          if (this.loops_remaining !== Infinity) this.loops_remaining -= 1;
          this.idx = 0;
        } else {
          this.idx = this.frames.length - 1;
          this.playing = false;
          this.animation_complete();
        }
      }
      return;
    }

    const last = this.frames.length - 1;
    this.idx += this.dir;

    if (this.idx > last) {
      if (this.loops_remaining === Infinity || this.loops_remaining > 1) {
        if (this.loops_remaining !== Infinity) this.loops_remaining -= 1;
        this.idx = last - 1;
        this.dir = -1;
      } else {
        this.idx = last;
        this.playing = false;
        this.animation_complete();
      }
    } else if (this.idx < 0) {
      if (this.loops_remaining === Infinity || this.loops_remaining > 1) {
        if (this.loops_remaining !== Infinity) this.loops_remaining -= 1;
        this.idx = 1;
        this.dir = 1;
      } else {
        this.idx = 0;
        this.playing = false;
        this.animation_complete();
      }
    }
  }
}
