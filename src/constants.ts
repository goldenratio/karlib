export const SCALE_MODE = {
  /**
   * Smooth scale
   */
  Linear: "linear",
  /**
   * Pixelating scaling
   */
  Nearest: "nearest",
} as const;

/**
 * no-operation
 */
export const NOOP = (): void => {
  // empty
};
