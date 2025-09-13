import type { Point, Rectangle } from "./types/index.js";

/**
 * Random integer between min and max. Includes min and max value
 * @param min
 * @param max
 */
export function random_int(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Random float between min and max. Inclusive min, exclusive max
 * @param min
 * @param max
 */
export function random_float(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function degree_to_radians(degree: number): number {
  return (degree * Math.PI) / 180;
}

/**
 * @returns value in radians
 */
export function angle_between_two_points(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.atan2(dy, dx);
}

export function clamp(value: number, min: number, max: number): number {
  if (min > max) [min, max] = [max, min]; // tolerate swapped bounds
  return value < min ? min : value > max ? max : value;
}
/**
 * Linearly interpolates between to any two values at time t.
 *
 * @param value0 The source value
 * @param value1 The destination value
 * @param time The unit time value (0-1)
 */
export function lerp(value0: number, value1: number, time: number) {
  return value0 + (value1 - value0) * time;
}

export function generate_uuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return legacy_uuid_v4();
}

function legacy_uuid_v4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function is_rect_colliding(target1: Rectangle, target2: Rectangle): boolean {
  /*return (Math.abs(target1.x - target2.x) * 2 < (target1.width + target2.width)) &&
      (Math.abs(target1.y - target2.y) * 2 < (target1.height + target2.height));
   */
  return !((target2.x > (target1.x + target1.width)) ||
    ((target2.x + target2.width) < target1.x) ||
    (target2.y > (target1.y + target1.height)) ||
    ((target2.y + target2.height) < target1.y)
  );
}

export function next_pow2(v: number): number {
  v += v === 0 ? 1 : 0;
  --v;
  v |= v >>> 1;
  v |= v >>> 2;
  v |= v >>> 4;
  v |= v >>> 8;
  v |= v >>> 16;

  return v + 1;
}

export function is_pow2(v: number): boolean {
  return !(v & (v - 1)) && (!!v);
}
