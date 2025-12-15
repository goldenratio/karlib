import type { Disposable, Mutable } from "@goldenratio/core-utils";
import { PoolBag, to_radians } from "@goldenratio/core-utils";

import type { Karlib } from "../karlib.js";
import type { Point } from "../types/types.js";

import { Particle } from "./particle.js";
import type { BehaviorConfigOf, EmitterConfig } from "./types.js";

/**
 * Particle Emitter
 * Implementation is based on pixi-particles
 * https://github.com/pixijs-userland/particle-emitter
 */
export class ParticleEmitter implements Disposable {
  private readonly pos: Mutable<Point>;
  private readonly particles_pool_bag: PoolBag<Particle>;
  private readonly particles: Particle[] = [];

  private readonly particles_per_wave: number;
  private readonly max_particles: number;
  private readonly is_infinite: boolean;
  private readonly frequency: number;
  private readonly emitter_life: number;

  private readonly spawn_burst_config?: BehaviorConfigOf<"spawnBurst">;
  private readonly spawn_shape_config?: BehaviorConfigOf<"spawnShape">;

  private emitter_age: number;
  private spawn_timer: number;
  private emit: boolean;
  private animation_complete_callback?: () => void = undefined;
  private completed: boolean = false;

  constructor(kl: Karlib, config: EmitterConfig) {
    this.spawn_timer = 0;

    this.particles_per_wave = config.particles_per_wave ?? 1;
    this.max_particles = config.max_particles ?? 20;
    this.frequency = Math.max(0.0001, config.frequency); // seconds per particle
    this.pos = { x: config.pos.x, y: config.pos.y };

    this.is_infinite = typeof config.emitter_lifetime === "undefined"
      ? true
      : config.emitter_lifetime === -1;

    this.emitter_age = 0;
    this.emitter_life = this.is_infinite ? Infinity : Math.max(0, config.emitter_lifetime ?? 1);
    this.emit = config.emit ?? true;

    // --- detect & cache spawnBurst config ---
    this.spawn_burst_config = config.behaviors.find(b => b.type === "spawnBurst")?.config;
    this.spawn_shape_config = config.behaviors.find(b => b.type === "spawnShape")?.config;

    this.particles_pool_bag = new PoolBag({
      create_pooled_item: () => new Particle(kl, config),
      on_returned_to_pool: (item) => item.reset(),
    });
  }

  dispose(): void {
    this.particles_pool_bag.dispose();
    this.particles.forEach(p => p.dispose());
    this.particles.length = 0;
    this.emit = false;
    this.animation_complete_callback = undefined;
  }

  /**
    * If particles should be emitted during update() calls. Setting this to false
    * stops new particles from being created, but allows existing ones to die out.
    */
  set_emit(value: boolean): void {
    if (this.emit !== value) {
      this.emit = value;
    }
  }

  /**
   * Callback is invoked when emitter animation completes.
   * This is supported only when emitter has valid lifetime,
   * If lifetime is -1, callback won't be invoked.
   * @param fn
   */
  set_on_animation_complete(fn: () => void): void {
    this.animation_complete_callback = () => fn();
  }

  /**
   * Changes the spawn position of the emitter.
   * Changing spawn position will restart the emitter
   * @param x The new x value of the spawn position for the emitter.
   * @param y The new y value of the spawn position for the emitter.
   */
  update_spawn_pos(x: number, y: number): void {
    this.pos.x = x;
    this.pos.y = y;
    this.spawn_timer = 0;
    this.emitter_age = 0;
    this.completed = false;
  }

  /**
   * Update loop
   * @param delta_time Scalar representing the delta time factor (value between 0 to 1)
   */
  update(delta_time: number): void {
    if (this.completed) {
      return;
    }

    // const delta = delta_time * 0.001; // basically 16.66ms / 1000
    // this.spawn_timer += delta; // ideally, 0.0166

    const delta = delta_time * 0.0166; // 0.0166 is (1 / 60);
    this.spawn_timer += delta;

    while (this.emit
      && this.spawn_timer >= this.frequency
      && this.particles.length < this.max_particles
      && this.emitter_age < this.emitter_life) {
      this.spawn_wave();
      this.spawn_timer -= this.frequency;
    }

    this.emitter_age += delta;

    // update particles and cull
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.update(delta);
      if (!p.is_alive) {
        const removed_p_list = this.particles.splice(i, 1);
        for (let j = 0; j < removed_p_list.length; j++) {
          const culled_p = removed_p_list[j];
          this.particles_pool_bag.release(culled_p);
        }
      }
    }

    if (
      !this.completed &&
      (!this.emit || this.emitter_age >= this.emitter_life) &&
      this.particles.length === 0
    ) {
      this.completed = true;
      this.on_emitter_animation_complete();
    }
  }

  draw(): void {
    if (this.completed) {
      return;
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].draw();
    }
  }

  private spawn_wave(): void {
    if (this.particles.length >= this.max_particles) {
      return;
    }
    for (let i = 0; i < this.particles_per_wave; i++) {
      const particle = this.particles_pool_bag.get();

      const shape_cfg = this.spawn_shape_config;
      const burst_cfg = this.spawn_burst_config;

      if (shape_cfg) {
        if (shape_cfg.type === "rect") {
          const r = shape_cfg.data;
          const sx = this.pos.x + r.x + Math.random() * r.w;
          const sy = this.pos.y + r.y + Math.random() * r.h;
          particle.update_spawn_pos(sx, sy);
          // direction/rotation come from particle's seeded behaviors
        } else if (shape_cfg.type === "torus") {
          const t = shape_cfg.data;
          const cx = this.pos.x + t.x;
          const cy = this.pos.y + t.y;

          // sample angle uniformly
          const angle = Math.random() * Math.PI * 2;

          // sample radius with uniform area density between innerRadius..radius
          const r0 = Math.max(0, Math.min(t.inner_radius, t.radius));
          const r1 = Math.max(t.inner_radius, t.radius);
          const u = Math.random();
          const rad = Math.sqrt(u * (r1 * r1 - r0 * r0) + r0 * r0);

          const sx = cx + Math.cos(angle) * rad;
          const sy = cy + Math.sin(angle) * rad;
          particle.update_spawn_pos(sx, sy);

          if (t.affect_rotation) {
            // make initial direction follow the radial angle
            particle.seed_direction_from_angle(angle);
          }
        }
      } else if (burst_cfg) {
        // Position on an arc/ring at fixed distance from emitter origin
        const angle_rad = burst_cfg.spacing === 0
          ? Math.random() * Math.PI * 2
          : to_radians(burst_cfg.start) + (to_radians(burst_cfg.spacing) * i);

        const x = this.pos.x + Math.cos(angle_rad);
        const y = this.pos.y + Math.sin(angle_rad);
        particle.update_spawn_pos(x, y);

        particle.seed_direction_from_angle(angle_rad);
      } else {
        // Default: spawnPoint at the emitter origin
        particle.update_spawn_pos(this.pos.x, this.pos.y);
      }

      this.particles.push(particle);
    }
  }

  private on_emitter_animation_complete(): void {
    this.animation_complete_callback?.();
  }
}
