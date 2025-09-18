import type { Disposable } from "../dispose_bag.js";
import type { Mutable } from "../types/index.js";

export interface TickerData {
  /**
   * milliseconds elapsed from last updated.
   * Ideally value should be 16.66 ms
   */
  readonly elapsed_ms: number;
  /**
   * last updated `performance.now()`
   */
  readonly last_time: number;

  /**
   * Ideally value between 0 and 1
   */
  readonly delta_time: number;
}

/**
 * Callback for ticker updates.
 *
 * @param delta_time - Scalar time value from last frame to this frame. This is NOT in milliseconds.
 */
export type TickerCallbackType = (ticker_data: TickerData) => void;

export class BrowserTicker implements Disposable {
  // Target frames per millisecond
  private readonly target_fpms: number;
  private readonly max_elapsed_ms = 100;

  private speed: number = 1;
  private last_time: number = -1;

  /**
   * Scalar representing the delta time factor.
   * This is a dimensionless value representing the fraction of a frame at the target framerate.
   * At 60 FPS, this value is typically around 1.0.
   * This is NOT in milliseconds
   * It's a scalar multiplier for frame-independent animations
   */
  private delta_time: number = 1;
  private elapsed_ms: number = 1;

  private raf_id: number = -1;
  private current_ticker_data: Mutable<TickerData> = {
    delta_time: 0,
    last_time: 0,
    elapsed_ms: 0,
  };

  constructor(fps: number = 60) {
    this.target_fpms = fps / 1000;
    this.elapsed_ms = 1 / this.target_fpms;
  }

  on_tick(fn: TickerCallbackType): void {
    if (this.raf_id !== -1) {
      // ticker already running
      throw new Error("Ticker already running");
    }

    const update_loop = (current_time: number = performance.now()) => {
      let elapsed_ms: number;
      if (current_time > this.last_time) {
        elapsed_ms = current_time - this.last_time;
        this.elapsed_ms = elapsed_ms;
        if (elapsed_ms > this.max_elapsed_ms) {
          elapsed_ms = this.max_elapsed_ms;
        }
        this.delta_time = elapsed_ms * this.target_fpms * this.speed;
      } else {
        this.delta_time = 0;
      }
      this.last_time = current_time;

      this.current_ticker_data.delta_time = this.delta_time;
      this.current_ticker_data.elapsed_ms = this.elapsed_ms;
      this.current_ticker_data.last_time = this.last_time;
      fn(this.current_ticker_data);

      this.raf_id = globalThis.requestAnimationFrame(update_loop);
    };

    this.raf_id = globalThis.requestAnimationFrame(update_loop);
  }

  set_speed(value: number): void {
    this.speed = value;
  }

  get_fps(): number {
    return (1000 / this.elapsed_ms) | 0;
  }

  dispose(): void {
    if (this.raf_id !== -1) {
      globalThis.cancelAnimationFrame(this.raf_id);
      this.raf_id = -1;
    }
    this.last_time = -1;
  }
}
