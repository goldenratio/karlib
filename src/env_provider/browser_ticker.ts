const rq = globalThis.requestAnimationFrame;

export class BrowserTicker {
  // Target frames per millisecond
  private readonly target_fpms: number;
  private readonly max_elapsed_ms = 100;

  private speed: number = 1;
  private last_time: number = -1;
  private delta_time: number = 1;
  private elapsed_ms: number = 1;

  constructor(fps: number = 60) {
    this.target_fpms = fps / 1000;
    this.elapsed_ms = 1 / this.target_fpms;
  }

  on_tick(fn: (delta_time: number) => void): void {
    const t = this;
    const update_loop = (current_time: number = performance.now()) => {
      let elapsed_ms: number;
      if (current_time > t.last_time) {
        elapsed_ms = current_time - t.last_time;
        this.elapsed_ms = elapsed_ms;
        if (elapsed_ms > t.max_elapsed_ms) {
          elapsed_ms = t.max_elapsed_ms;
        }
        t.delta_time = elapsed_ms * t.target_fpms * t.speed;
      } else {
        t.delta_time = 0;
      }
      t.last_time = current_time;

      fn(t.delta_time);

      rq(update_loop);
    };

    rq(update_loop);
  }

  set_speed(value: number): void {
    this.speed = value;
  }

  get_fps(): number {
    return (1000 / this.elapsed_ms) | 0;
  }
}
