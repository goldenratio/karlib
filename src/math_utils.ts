import type { Mutable } from "@goldenratio/core-utils";
import type { Point, Rectangle } from "./types/index.js";

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

/**
 * Distance between 2 points
 * Less accurate, but faster
 */
export function distance_square(p1: Point, p2: Point): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return dx * dx + dy * dy;
}

/**
 * Copies Rectangle from src to dest
 */
export function copy_rect(dest: Partial<Mutable<Rectangle>>, src: Partial<Rectangle>): void {
  dest.x = src.x ?? dest.x;
  dest.y = src.y ?? dest.y;
  dest.width = src.width ?? dest.width;
  dest.height = src.height ?? dest.height;
}

/**
 * Copies Point from src to dest
 */
export function copy_point(dest: Partial<Mutable<Point>>, src: Partial<Point>): void {
  dest.x = src.x ?? dest.x;
  dest.y = src.y ?? dest.y;
}

/**
 * Rotates a point by a given angle.
 * @param src The point to rotate around 0,0.
 * @param angle_radians The angle to rotate by in radians
 */
export function rotate_point(src: Mutable<Point>, angle_radians: number): void {
  if (!angle_radians) return;

  const s = Math.sin(angle_radians);
  const c = Math.cos(angle_radians);
  const xnew = (src.x * c) - (src.y * s);
  const ynew = (src.x * s) + (src.y * c);

  src.x = xnew;
  src.y = ynew;
}
