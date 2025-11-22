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

/**
 * Get random item from an array
 */
export function random_item_from_array<T = unknown>(src: readonly T[]): T | undefined {
  const idx = random_int(0, src.length - 1);
  return src[idx] ?? undefined;
}

/**
 * Convert degree to radians
 */
export function to_radians(degree: number): number {
  return (degree * Math.PI) / 180;
}

/**
 * Convert radians to degrees
 */
export function to_degrees(radians: number): number {
  return radians * (180 / Math.PI);
}

/**
 * Ensures that any given angle in degrees is converted (or “normalized”) to a value within the standard 0–359
 * @param degree in degree
 * @returns in degree
 */
export function normalize_angle(degree: number): number {
  degree = degree % 360;
  return degree < 0 ? degree + 360 : degree;
}

/**
 * Returns the smallest difference between two angles, measured in degrees.
 * The result is always in the range [0, 180].
 * @param angle1_degree in degree
 * @param angle2_degree in degree
 * @returns in degree
 */
export function get_angle_difference(angle1_degree: number, angle2_degree: number): number {
  const diff = Math.abs(angle1_degree - angle2_degree);
  return Math.min(diff, 360 - diff);
}

/**
 * Restricts a value to lie within the inclusive range [min, max].
 * Automatically swaps bounds if min > max.
 */
export function clamp(value: number, min: number, max: number): number {
  if (min > max) [min, max] = [max, min]; // tolerate swapped bounds
  return value < min ? min : value > max ? max : value;
}

/**
 * Maps a number from one range to another, preserving its relative position.
 * The result is clamped to the source range before mapping.
 */
export function map_range(
  value: number,
  range1: number,
  range2: number,
  target_range1: number,
  target_range2: number
): number {
  if (target_range1 === target_range2 || range1 === range2) {
    return target_range1;
  }
  let normalizedValue = value;
  if (normalizedValue < range1) {
    normalizedValue = range1;
  } else if (normalizedValue > range2) {
    normalizedValue = range2;
  }
  // first map value from (a..b) to (0..1)
  const v = (normalizedValue - range1) / (range2 - range1);
  // then map it from (0..1) to (c..d) and return it
  return target_range1 + v * (target_range2 - target_range1);
}

/**
 * Linearly interpolates between to any two values at time t.
 *
 * @param value0 The source value
 * @param value1 The destination value
 * @param time The unit time value (0-1)
 */
export function lerp(value0: number, value1: number, time: number): number {
  return value0 + (value1 - value0) * time;
}

/**
 * Computes the smallest power of two greater than or equal to the given number.
 * Returns 1 for an input of 0.
 */
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

/**
 * Checks whether a given number is a power of two.
 */
export function is_pow2(v: number): boolean {
  return !(v & (v - 1)) && (!!v);
}

// ---- Geometry utils ----

/**
 * Tells if 2 Rectangles are colliding
 */
export function is_rect_colliding(target1: Rectangle, target2: Rectangle): boolean {
  return !((target2.x > (target1.x + target1.width)) ||
    ((target2.x + target2.width) < target1.x) ||
    (target2.y > (target1.y + target1.height)) ||
    ((target2.y + target2.height) < target1.y)
  );
}


/**
 * Find angle between 2 points
 * @returns value in radians
 */
export function angle_between_two_points(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.atan2(dy, dx);
}

/**
 * Creates a vector (Point) from an angle and radius.
 */
export function vec_from_angle(radians: number, radius: number = 1): Point {
  return {
    x: Math.cos(radians) * radius,
    y: Math.sin(radians) * radius,
  };
}

/**
 * Distance between 2 points
 */
export function distance_between_two_points(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}
