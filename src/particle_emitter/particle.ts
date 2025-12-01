import type { Disposable, Mutable } from "@goldenratio/core-utils";
import { unwrap } from "@goldenratio/core-utils";

import type { Karlib } from "../karlib.js";
import type { DrawTextureOptions, Point } from "../types/types.js";
import { clamp, lerp, random_item_from_array, to_degrees, to_radians, vec_from_angle } from "../math_utils.js";

import type { EmitterConfigValue, EmitterConfig, BehaviorConfigOf } from "./types.js";
import { AnimatedTexture, type DrawAnimatedTextureOptions } from "../animated_texture.js";

function hex_to_rgb(hex: string): { r: number, g: number, b: number } {
  const h = hex.replace("#", "");
  const bigint = parseInt(h.length === 3 ? h.split("").map(c => c + c).join("") : h, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}

function rgb_to_hex({ r, g, b }: { r: number, g: number, b: number }): string {
  const toHex = (v: number) => v.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function sample_key_frames<TValue>(list: readonly EmitterConfigValue<TValue>[], t: number): TValue {
  // list: [{time:0..1, value:number|string}]
  t = clamp(t, 0, 1);
  if (!list || list.length === 0) return 0 as TValue;
  if (list.length === 1) return list[0].value;
  // find segment
  let a = list[0], b = list[list.length - 1];
  for (let i = 0; i < list.length - 1; i++) {
    if (t >= list[i].time && t <= list[i + 1].time) { a = list[i]; b = list[i + 1]; break; }
  }
  const span = (b.time - a.time) || 1e-6;
  const lt = (t - a.time) / span;
  // numeric or color
  if (typeof a.value === "number" && typeof b.value === "number") {
    return lerp(a.value, b.value, lt) as TValue;
  } else {
    const ca = hex_to_rgb(a.value as string);
    const cb = hex_to_rgb(b.value as string);
    return rgb_to_hex({
      r: Math.round(lerp(ca.r, cb.r, lt)),
      g: Math.round(lerp(ca.g, cb.g, lt)),
      b: Math.round(lerp(ca.b, cb.b, lt))
    }) as TValue;
  }
}

export class Particle implements Disposable {
  private readonly kl: Karlib;
  private readonly config: EmitterConfig;
  private readonly get_speed?: (t: number) => number;
  private readonly get_alpha?: (t: number) => number;
  private readonly get_color?: (t: number) => string;
  private readonly get_scale?: (t: number) => number;
  private readonly static_draw_texture_options?: Mutable<DrawTextureOptions> = undefined;

  private readonly animated_texture?: AnimatedTexture = undefined;
  private readonly animated_draw_texture_options?: Mutable<DrawAnimatedTextureOptions> = undefined;

  private readonly rot_cfg?: BehaviorConfigOf<"rotation">;
  private readonly rot_static_cfg?: BehaviorConfigOf<"rotationStatic">;
  private readonly accel_cfg?: BehaviorConfigOf<"moveAcceleration">;

  private age: number = 0;
  private life: number = 1;
  private pos: Mutable<Point> = { x: 0, y: 0 };
  private direction: Mutable<Point> = { x: 0, y: 0 };

  private rotation: number = 0; // radians
  private rot_speed: number = 0; // rad/s
  private rot_accel: number = 0; // rad/s^2

  // --- kinematics for moveAcceleration ---
  private vel: Mutable<Point> = { x: 0, y: 0 }; // px/s
  private acc: Mutable<Point> = { x: 0, y: 0 }; // px/s^2
  private max_speed: number = Infinity;
  private rotate_to_velocity: boolean = false;
  private use_accel_motion: boolean = false;

  constructor(kl: Karlib, config: EmitterConfig) {
    this.kl = kl;
    this.config = config;

    const alpha_list = config.behaviors.find(b => b.type === "alpha")?.config.alpha.list;
    if (alpha_list) {
      this.get_alpha = t => sample_key_frames(alpha_list, t);
    }
    const alpha_static = config.behaviors.find(b => b.type === "alphaStatic")?.config.alpha;
    if (typeof alpha_static === "number") {
      this.get_alpha = _ => alpha_static;
    }

    const color_list = config.behaviors.find(b => b.type === "color")?.config.color.list;
    if (color_list) {
      this.get_color = t => sample_key_frames(color_list, t);
    }
    const color_static = config.behaviors.find(b => b.type === "colorStatic")?.config.color;
    if (color_static) {
      this.get_color = _ => color_static;
    }

    const scale_cfg = config.behaviors.find(b => b.type === "scale")?.config;
    if (scale_cfg) {
      this.get_scale = t => sample_key_frames(scale_cfg.scale.list, t) * (scale_cfg.min_mult ?? 1);
    }
    const scale_static = config.behaviors.find(b => b.type === "scaleStatic")?.config;
    if (scale_static) {
      this.get_scale = _ => (Math.random() * (scale_static.max - scale_static.min)) + scale_static.min;
    }

    const speed_cfg = config.behaviors.find(b => b.type === "moveSpeed")?.config;
    if (speed_cfg) {
      this.get_speed = t => sample_key_frames(speed_cfg.speed.list, t) * (speed_cfg.min_mult ?? 1);
    }
    const speed_static_cfg = config.behaviors.find(b => b.type === "moveSpeedStatic")?.config;
    if (speed_static_cfg) {
      this.get_speed = _ => (Math.random() * (speed_static_cfg.max - speed_static_cfg.min)) + speed_static_cfg.min;
    }

    const texture_cfg = config.behaviors.find(b => b.type === "textureSingle")?.config;
    if (texture_cfg) {
      this.static_draw_texture_options = {
        texture: texture_cfg.texture,
        pivot: { x: 0.5, y: 0.5 },
      }
    }
    const texture_random_cfg = config.behaviors.find(b => b.type === "textureRandom")?.config;
    if (texture_random_cfg) {
      this.static_draw_texture_options = {
        texture: unwrap(random_item_from_array(texture_random_cfg.textures), "error get random texture"),
        pivot: { x: 0.5, y: 0.5 }
      }
    }

    const animated_single_cfg = config.behaviors.find(b => b.type === "animatedSingle")?.config;
    if (animated_single_cfg) {
      this.animated_texture = new AnimatedTexture(kl, {
        frames: animated_single_cfg.anim.textures,
        frame_duration: animated_single_cfg.anim.frame_duration,
        loop: animated_single_cfg.anim.loop ? Infinity : 1,
      });

      this.animated_draw_texture_options = {
        pivot: { x: 0.5, y: 0.5 }
      };
    }
    const animated_random_cfg = config.behaviors.find(b => b.type === "animatedRandom")?.config;
    if (animated_random_cfg) {
      const anim_cfg = unwrap(random_item_from_array(animated_random_cfg.anims), "error getting random animation config");
      this.animated_texture = new AnimatedTexture(kl, {
        frames: anim_cfg.textures,
        frame_duration: anim_cfg.frame_duration,
        loop: anim_cfg.loop ? Infinity : 1,
      });

      this.animated_draw_texture_options = {
        pivot: { x: 0.5, y: 0.5 }
      };

    }

    this.rot_static_cfg = config.behaviors.find(b => b.type === "rotationStatic")?.config;
    this.rot_cfg = config.behaviors.find(b => b.type === "rotation")?.config;
    this.accel_cfg = config.behaviors.find(b => b.type === "moveAcceleration")?.config;

    if (this.static_draw_texture_options) {
      this.static_draw_texture_options.blend_mode = config.blend_mode;
    }

    if (this.animated_draw_texture_options) {
      this.animated_draw_texture_options.blend_mode = config.blend_mode;
    }
    this.reset();
  }

  /**
   * Called when particle is destroyed
   */
  dispose(): void {
    // empty
  }

  /**
   * Called when particle is added to pool bag
   */
  reset(): void {
    const config = this.config;
    const life = lerp(config.lifetime.min, config.lifetime.max, Math.random());
    this.life = life; // seconds total
    this.age = 0; // seconds elapsed
    this.pos.x = config.pos.x;
    this.pos.y = config.pos.y;

    this.seed_rotation_from_behaviors();

    // --- NEW: initialize acceleration-based motion if configured ---
    if (this.accel_cfg) {
      this.use_accel_motion = true;

      // Initial speed along seeded direction
      const startSpeed = lerp(this.accel_cfg.min_start, this.accel_cfg.max_start, Math.random());
      this.vel.x = this.direction.x * startSpeed;
      this.vel.y = this.direction.y * startSpeed;

      // Constant world acceleration
      this.acc.x = this.accel_cfg.accel.x;
      this.acc.y = this.accel_cfg.accel.y;

      // Speed clamp
      this.max_speed = (this.accel_cfg.max_speed ?? Number.POSITIVE_INFINITY) || Number.POSITIVE_INFINITY;

      // If we rotate to velocity, disable angular animation
      this.rotate_to_velocity = !!this.accel_cfg.rotate;
      if (this.rotate_to_velocity) {
        this.rot_speed = 0;
        this.rot_accel = 0;
        // Align initial visual rotation to velocity direction
        if (this.vel.x !== 0 || this.vel.y !== 0) {
          this.rotation = Math.atan2(this.vel.y, this.vel.x);
        }
      }
    } else {
      // Fallback to speed-over-lifetime mode
      this.use_accel_motion = false;
      this.vel.x = this.vel.y = 0;
      this.acc.x = this.acc.y = 0;
      this.max_speed = Infinity;
      this.rotate_to_velocity = false;
    }
    // --------------------------------------------------------------
  }

  update_spawn_pos(x: number, y: number): void {
    this.pos.x = x;
    this.pos.y = y;
  }

  update(delta: number): void {
    this.age += delta;
    if (!this.is_alive) {
      return;
    }
    // Integrate rotation
    this.rot_speed += this.rot_accel * delta; // ω = ω0 + α t
    this.rotation += this.rot_speed * delta;

    if (this.use_accel_motion) {
      // --- acceleration kinematics ---
      // v = v0 + a t
      this.vel.x += this.acc.x * delta;
      this.vel.y += this.acc.y * delta;

      // clamp |v|
      const speedSq = this.vel.x * this.vel.x + this.vel.y * this.vel.y;
      if (isFinite(this.max_speed) && this.max_speed > 0) {
        const maxSq = this.max_speed * this.max_speed;
        if (speedSq > maxSq) {
          const s = Math.sqrt(speedSq);
          const k = this.max_speed / (s || 1e-6);
          this.vel.x *= k;
          this.vel.y *= k;
        }
      }

      // p = p0 + v t
      this.pos.x += this.vel.x * delta;
      this.pos.y += this.vel.y * delta;

      // Optional: make sprite face velocity
      if (this.rotate_to_velocity && (this.vel.x !== 0 || this.vel.y !== 0)) {
        this.rotation = Math.atan2(this.vel.y, this.vel.x);
      }
    } else {
      // speed-over-lifetime path
      const t = clamp(this.age / this.life, 0, 1);
      const speed = this.get_speed?.(t) ?? 1; // px/s
      this.pos.x += this.direction.x * speed * delta;
      this.pos.y += this.direction.y * speed * delta;

      // Keep visual rotation integrating in this mode
      this.rotation += this.rot_speed * delta;
    }

    const texture_options = this.static_draw_texture_options || this.animated_draw_texture_options;
    if (texture_options) {
      const t = clamp(this.age / this.life, 0, 1);
      const alpha = this.get_alpha?.(t) ?? undefined;
      const color = this.get_color?.(t) ?? undefined;
      const scale = this.get_scale?.(t) ?? undefined;

      texture_options.x = this.pos.x;
      texture_options.y = this.pos.y;
      texture_options.alpha = alpha;
      texture_options.scale = scale;
      texture_options.tint_color = color;
      texture_options.rotate = to_degrees(this.rotation);
    }
  }

  draw(): void {
    if (!this.is_alive) {
      return;
    }

    if (this.static_draw_texture_options) {
      this.kl.draw_texture(this.static_draw_texture_options);
    }

    if (this.animated_texture) {
      this.animated_texture.draw(this.animated_draw_texture_options);
    }
  }

  get is_alive() {
    return this.age < this.life;
  }

  seed_direction_from_angle(rad: number): void {
    this.direction.x = Math.cos(rad);
    this.direction.y = Math.sin(rad);
    if (this.rotate_to_velocity) {
      this.rotation = rad;
    }
  }

  private seed_rotation_from_behaviors(): void {
    // Visual rotation (independent from movement)
    if (this.rot_static_cfg) {
      const min = this.rot_static_cfg.min;
      const max = this.rot_static_cfg.max;
      const deg = lerp(min, max, Math.random());
      this.rotation = to_radians(deg);
      this.rot_speed = 0;
      this.rot_accel = 0;
      const rad = to_radians(deg);
      const dir = vec_from_angle(rad);
      this.direction.x = dir.x;
      this.direction.y = dir.y;
    } else if (this.rot_cfg) {
      const startDeg = lerp(this.rot_cfg.min_start, this.rot_cfg.max_start, Math.random());
      const speedDeg = lerp(this.rot_cfg.min_speed, this.rot_cfg.max_speed, Math.random());
      this.rotation = to_radians(startDeg);
      this.rot_speed = to_radians(speedDeg);
      this.rot_accel = to_radians(this.rot_cfg.accel);
      const deg = lerp(this.rot_cfg.min_start, this.rot_cfg.max_start, Math.random());
      const rad = to_radians(deg);
      const dir = vec_from_angle(rad);
      this.direction.x = dir.x;
      this.direction.y = dir.y;
    } else {
      this.rotation = 0;
      this.rot_speed = 0;
      this.rot_accel = 0;
      const deg = lerp(0, 360, Math.random());
      const rad = to_radians(deg);
      const dir = vec_from_angle(rad);
      this.direction.x = dir.x;
      this.direction.y = dir.y;
    }
  }
}
