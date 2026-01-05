import type { Disposable } from "@goldenratio/core-utils";
import { clamp, lerp } from "@goldenratio/core-utils";

const easing = {
  "linear": (t: number): number => t,
  "easeInQuad": (t: number): number => t * t,
  "easeOutQuad": (t: number): number => t * (2 - t),
  "easeInOutQuad": (t: number): number => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  "easeInCubic": (t: number): number => t * t * t,
  "easeOutCubic": (t: number): number => 1 - Math.pow(1 - t, 3),
  "easeInOutCubic": (t: number): number => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  "easeOutBounce": (t: number): number => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  }
} as const;

export type EasingType = keyof typeof easing;
export type EasingFn = (t: number) => number;

// The duration of a single frame at 60 FPS in milliseconds
const MS_PER_FRAME = 1 / (60 / 1000); // 16.666666666666668

export class Tween implements Disposable {
  private states: Map<symbol, number>;
  private delta_time: number = 1;

  constructor() {
    this.states = new Map();
  }

  dispose(): void {
    this.states.clear();
  }

  /**
   * set delta time
   * @param {number} delta_time - Scalar representing the delta time factor (value is between 0 to 1)
   */
  set_delta_time(delta_time: number): void {
    this.delta_time = delta_time;
  }

  /**
   * Computes an interpolated value between `from` and `to` using an easing function.
   * This should typically be called once per frame.
   *
   * @param {symbol} owner - Unique identifier that will own this tween
   * @param {number} from - Start value
   * @param {number} to - End value
   * @param {EasingType | EasingFn} type - Easing name
   * @param {number} duration_ms - Total time in milliseconds
   * @param {number} [delay_ms=0] - Time to wait before starting interpolation
   */
  to(owner: symbol, from: number, to: number, type: EasingType | EasingFn, duration_ms: number, delay_ms: number = 0): number {
    if (duration_ms <= 0) {
      return to;
    }

    // Convert scalar delta to milliseconds and update state
    const elapsed_ms = (this.states.get(owner) ?? 0) + (this.delta_time * MS_PER_FRAME);

    const total_ms = delay_ms + duration_ms;
    const clamped_ms = clamp(elapsed_ms, 0, total_ms);
    this.states.set(owner, clamped_ms);

    // Still in delay phase
    if (clamped_ms < delay_ms) {
      return from;
    }

    // Animation finished
    if (clamped_ms >= total_ms) {
      return to;
    }

    // Calculate progress based on ms
    const animation_ms = clamped_ms - delay_ms;
    const t = animation_ms / duration_ms;
    const eased = typeof type === "string" ? easing[type](t) : type(t);

    return lerp(from, to, eased);
  }

  /**
   * Clears the tween state for the given owner.
   * Call this when you want to restart the animation from the beginning.
   *
   * @param {symbol} owner - The animation owner whose state should be reset.
   */
  clear(owner: symbol): void {
    this.states.delete(owner);
  }
}
