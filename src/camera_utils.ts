import type { Disposable } from "@goldenratio/core-utils";
import type { EnvProvider } from "./env_provider/env_provider.js";
import type { Camera2D, Point, Rectangle, Size } from "./types.js";

export class Camera2DUtil implements Disposable {
  private readonly env: EnvProvider;
  private readonly canvas_size: Size;

  constructor(env: EnvProvider, canvas_size: Size) {
    this.env = env;
    this.canvas_size = canvas_size;
  }

  dispose(): void {
    // empty
  }

  /**
   * Compute the world→screen transform matrix for the given camera.
   * This mirrors the logic in draw_mode_2d.
   */
  get_camera_transform(camera: Camera2D): DOMMatrix {
    const { offset, target, rotation, zoom } = camera;

    let matrix = this.env.create_dom_matrix();

    if (zoom === 0) {
      // Degenerate, but return identity to avoid NaNs everywhere
      return matrix;
    }

    // Screen-space offset where the camera centers its target
    matrix = matrix.translate(offset.x, offset.y);

    // Zoom
    if (zoom !== 1) {
      matrix = matrix.scale(zoom, zoom);
    }

    // Rotation (degrees)
    if (rotation !== 0) {
      matrix = matrix.rotate(rotation);
    }

    // Move world so that target sits at the origin
    matrix = matrix.translate(-target.x, -target.y);

    return matrix;
  }

  /**
   * Helper to apply a DOMMatrix to a point.
   */
  private transform_point(matrix: DOMMatrix, x: number, y: number): Point {
    const p = matrix.transformPoint({ x, y });
    return { x: p.x, y: p.y };
  }

  /**
   * Returns true if the given world-space axis-aligned rectangle is visible
   * in the camera's view (intersects the canvas in screen-space).
   *
   * padding: extra screen pixels around the canvas to treat as "visible".
   *          (Useful to draw slightly offscreen objects for smooth entry.)
   */
  is_rect_in_camera_view(rect: Rectangle, camera: Camera2D, padding: number = 0): boolean {
    const { x, y, width, height } = rect;

    if (width <= 0 || height <= 0) {
      return false;
    }

    if (camera.zoom === 0) {
      return false;
    }

    const canvas_min_x = -padding;
    const canvas_max_x = this.canvas_size.width + padding;

    const canvas_min_y = -padding;
    const canvas_max_y = this.canvas_size.height + padding;

    // fast path - no rotation
    if (camera.rotation === 0) {
      // Convert world rect -> screen rect using simple zoom/offset math
      let sx1 = (x - camera.target.x) * camera.zoom + camera.offset.x;
      let sx2 = (x + width - camera.target.x) * camera.zoom + camera.offset.x;

      let sy1 = (y - camera.target.y) * camera.zoom + camera.offset.y;
      let sy2 = (y + height - camera.target.y) * camera.zoom + camera.offset.y;

      // Ensure proper min/max
      if (sx1 > sx2) {
        [sx1, sx2] = [sx2, sx1];
      }

      if (sy1 > sy2) {
        [sy1, sy2] = [sy2, sy1];
      }

      const noOverlap =
        sx2 < canvas_min_x ||
        sx1 > canvas_max_x ||
        sy2 < canvas_min_y ||
        sy1 > canvas_max_y;

      return !noOverlap;
    }

    const m = this.get_camera_transform(camera);
    // Transform the 4 corners to screen space
    const p0 = this.transform_point(m, x, y);
    const p1 = this.transform_point(m, x + width, y);
    const p2 = this.transform_point(m, x, y + height);
    const p3 = this.transform_point(m, x + width, y + height);

    const min_screen_x = Math.min(p0.x, p1.x, p2.x, p3.x);
    const max_screen_x = Math.max(p0.x, p1.x, p2.x, p3.x);

    const min_screen_y = Math.min(p0.y, p1.y, p2.y, p3.y);
    const max_screen_y = Math.max(p0.y, p1.y, p2.y, p3.y);

    // AABB vs AABB intersection in screen-space
    const no_overlap =
      max_screen_x < canvas_min_x ||
      min_screen_x > canvas_max_x ||
      max_screen_y < canvas_min_y ||
      min_screen_y > canvas_max_y;

    return !no_overlap;
  }

  /**
   * Returns true if the given world-space point is inside the camera view.
   */
  is_point_in_camera_view(point: Point, camera: Camera2D, padding: number = 0): boolean {
    if (camera.zoom === 0) {
      return false;
    }

    const { x, y } = point;
    const canvas_min_x = -padding;
    const canvas_max_x = this.canvas_size.width + padding;

    const canvas_min_y = -padding;
    const canvas_max_y = this.canvas_size.height + padding;

    // fast path - no rotation
    if (camera.rotation === 0) {
      // Convert world-space point -> screen-space
      const sx = (x - camera.target.x) * camera.zoom + camera.offset.x;
      const sy = (y - camera.target.y) * camera.zoom + camera.offset.y;

      return (
        sx >= canvas_min_x &&
        sx <= canvas_max_x &&
        sy >= canvas_min_y &&
        sy <= canvas_max_y
      );
    }

    const m = this.get_camera_transform(camera);
    const p = this.transform_point(m, x, y);

    return (
      p.x >= canvas_min_x &&
      p.x <= canvas_max_x &&
      p.y >= canvas_min_y &&
      p.y <= canvas_max_y
    );
  }

}
