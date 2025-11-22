import type { Point } from "./types/types.js";

/**
 * Represents a 2D vector with basic vector math operations.
 * Implements the {@link Point} interface.
 */
export class Vector implements Point {
  /** The x-coordinate of the vector. */
  x: number;

  /** The y-coordinate of the vector. */
  y: number;

  /**
   * Creates a new vector instance.
   * @param {number} [x=0] - The x-coordinate.
   * @param {number} [y=0] - The y-coordinate.
   */
  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  /**
   * Copies the values from another vector into this vector.
   * @param {Vector} other - The vector to copy from.
   * @returns {this} This vector.
   */
  copy(other: Vector): this {
    this.x = other.x;
    this.y = other.y;
    return this;
  }

  /**
   * Creates a new vector with the same x and y values.
   * @returns {Vector} A cloned vector.
   */
  clone(): Vector {
    return new Vector(this.x, this.y);
  }

  /**
   * Rotates the vector 90 degrees counterclockwise.
   * @returns {this} This vector.
   */
  perp(): this {
    const x = this.x;
    this.x = this.y;
    this.y = -x;
    return this;
  }

  /**
   * Rotates the vector by a given angle in radians.
   * @param {number} angle_radians
   * @returns {this} This vector.
   */
  rotate(angle_radians: number): this {
    const x = this.x;
    const y = this.y;
    this.x = x * Math.cos(angle_radians) - y * Math.sin(angle_radians);
    this.y = x * Math.sin(angle_radians) + y * Math.cos(angle_radians);
    return this;
  }

  /**
   * Reverses the direction of the vector.
   * @returns {this} This vector.
   */
  reverse(): this {
    this.x = -this.x;
    this.y = -this.y;
    return this;
  }

  /**
   * Normalizes the vector to unit length.
   * @returns {this} This vector.
   */
  normalize(): this {
    const d = this.len();
    if (d > 0) {
      this.x = this.x / d;
      this.y = this.y / d;
    }
    return this;
  }

  /**
   * Adds another vector to this vector.
   * @param {Vector} other - The vector to add.
   * @returns {this} This vector.
   */
  add(other: Vector): this {
    this.x += other.x;
    this.y += other.y;
    return this;
  }

  /**
   * Subtracts another vector from this vector.
   * @param {Vector} other - The vector to subtract.
   * @returns {this} This vector.
   */
  sub(other: Vector): this {
    this.x -= other.x;
    this.y -= other.y;
    return this;
  }

  /**
   * Scales the vector by given factors.
   * @param {number} x - Scale factor for x.
   * @param {number} [y=x] - Optional scale factor for y (defaults to x).
   * @returns {this} This vector.
   */
  scale(x: number, y?: number): this {
    this.x *= x;
    this.y *= typeof y !== "undefined" ? y : x;
    return this;
  }

  /**
   * Projects this vector onto another vector.
   * @param {Vector} other - The vector to project onto.
   * @returns {this} This vector after projection.
   */
  project(other: Vector): this {
    const amt = this.dot(other) / other.len2();
    this.x = amt * other.x;
    this.y = amt * other.y;
    return this;
  }

  /**
   * Projects this vector onto a normalized vector.
   * @param {Vector} other - A normalized vector to project onto.
   * @returns {this} This vector after projection.
   */
  project_n(other: Vector): this {
    const amt = this.dot(other);
    this.x = amt * other.x;
    this.y = amt * other.y;
    return this;
  }

  /**
   * Reflects this vector across a given axis vector.
   * @param {Vector} axis - The axis to reflect across.
   * @returns {this} This vector.
   */
  reflect(axis: Vector): this {
    const x = this.x;
    const y = this.y;
    this.project(axis).scale(2);
    this.x -= x;
    this.y -= y;
    return this;
  }

  /**
   * Reflects this vector across a normalized axis vector.
   * @param {Vector} axis - The normalized axis to reflect across.
   * @returns {this} This vector.
   */
  reflect_n(axis: Vector): this {
    const x = this.x;
    const y = this.y;
    this.project_n(axis).scale(2);
    this.x -= x;
    this.y -= y;
    return this;
  }

  /**
   * Computes the dot product of this vector and another.
   * @param {Vector} other - The other vector.
   * @returns {number} The dot product.
   */
  dot(other: Vector): number {
    return this.x * other.x + this.y * other.y;
  }

  /**
   * Computes the squared length (magnitude) of the vector.
   * @returns {number} The squared length.
   */
  len2(): number {
    return this.dot(this);
  }

  /**
   * Get the Euclidean length.
   * @returns {number} The length.
   */
  len(): number {
    return Math.sqrt(this.len2());
  }

  /**
   * Create Vector from Point
   */
  static from_point(point: Point): Vector {
    return new Vector(point.x, point.y);
  }

  /**
   * Creates a vector from an angle and radius.
   */
  static from_angle(radians: number, radius: number): Vector {
    const x = Math.cos(radians) * radius;
    const y = Math.sin(radians) * radius;
    return new Vector(x, y);
  }
}
