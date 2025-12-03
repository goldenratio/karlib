import type { EnvProvider } from "./env_provider/env_provider.js";
import type { Camera2D, Point, Rectangle, Size } from "./types/types.js";

export class Camera2DUtil {
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

    const m = this.env.create_dom_matrix();

    if (zoom === 0) {
      // Degenerate, but return identity to avoid NaNs everywhere
      return m;
    }

    let out = m;

    // Screen-space offset where the camera centers its target
    out = out.translate(offset.x, offset.y);

    // Zoom
    if (zoom !== 1) {
      out = out.scale(zoom, zoom);
    }

    // Rotation (degrees)
    if (rotation !== 0) {
      out = out.rotate(rotation);
    }

    // Move world so that target sits at the origin
    out = out.translate(-target.x, -target.y);

    return out;
  }

  /**
   * Helper to apply a DOMMatrix to a point.
   */
  private transform_point(m: DOMMatrix, x: number, y: number): Point {
    const p = m.transformPoint({ x, y });
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

    const canvas_min_x = -padding;
    const canvas_min_y = -padding;
    const canvas_max_x = this.canvas_size.width + padding;
    const canvas_max_y = this.canvas_size.height + padding;

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
  is_point_in_camera_view(
    point: Point,
    camera: Camera2D,
    padding: number = 0
  ): boolean {
    if (camera.zoom === 0) {
      return false;
    }

    const { x, y } = point;
    const m = this.get_camera_transform(camera);
    const p = this.transform_point(m, x, y);

    const canvas_min_x = -padding;
    const canvas_min_y = -padding;
    const canvas_max_x = this.canvas_size.width + padding;
    const canvas_max_y = this.canvas_size.height + padding;

    return (
      p.x >= canvas_min_x &&
      p.x <= canvas_max_x &&
      p.y >= canvas_min_y &&
      p.y <= canvas_max_y
    );
  }

}
