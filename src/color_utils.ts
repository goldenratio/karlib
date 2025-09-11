/**
 * Converts a numeric hex value CSS color string (hex)
 *
 * @param color - e.g. 0xff0000
 * @returns e.g. ""#FF0000""
 */
export function hex_to_string(color: number): string {
  // Clamp and mask to prevent negatives / alpha bits sneaking in.
  const v = Math.max(0, Math.min(0xFFFFFF, color | 0)) & 0xFFFFFF;
  return "#" + v.toString(16).padStart(6, "0");
}

/**
 * Converts a CSS color string (rgb or hex) to a numeric hex value.
 *
 * @param color - e.g. "rgb(255, 0, 0)" or "#FF0000"
 * @returns e.g. 0xff0000
 */
export function string_to_hex(color: string): number {
  color = color.trim();

  // Handle hex format (#RRGGBB or #RGB)
  if (color.startsWith("#")) {
    let hex = color.slice(1);

    // Expand shorthand form (#RGB → #RRGGBB)
    if (hex.length === 3) {
      hex = hex.split("").map(c => c + c).join("");
    }

    return Number("0x" + hex);
  }

  // Handle rgb format (rgb(r, g, b))
  const rgbMatch = color.match(/^rgb\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1], 10);
    const g = parseInt(rgbMatch[2], 10);
    const b = parseInt(rgbMatch[3], 10);

    return (r << 16) + (g << 8) + b;
  }

  return 0x000000;
}
