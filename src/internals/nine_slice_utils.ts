/**
 * A helper for drawing a slice (Source x, y, w, h -> Dest x, y, w, h)
 */
export function draw_slice(
  sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, dw: number, dh: number,
  dpr_scale: number,
  src_image: ImageBitmap,
  dest_ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
): void {
  if (sw > 0 && sh > 0 && dw > 0 && dh > 0) {
    const native_sx = sx * dpr_scale;
    const native_sy = sy * dpr_scale;
    const native_sw = sw * dpr_scale;
    const native_sh = sh * dpr_scale;

    dest_ctx.drawImage(
      src_image,
      native_sx | 0, native_sy | 0, native_sw | 0, native_sh | 0,
      dx | 0, dy | 0, dw | 0, dh | 0
    );
  }
};
