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
