/**
 * Asserts that the given object is not `undefined` or `null`.
 * Throws an error with the provided assertion message if the check fails.
 *
 * @param obj - The object to check.
 * @param assertion - The error message to throw if the assertion fails.
 * @throws {Error} If `obj` is `undefined` or `null`.
 */
export function assert_exists(obj: unknown, assertion: string): void {
  if (typeof obj === 'undefined' || obj === null) {
    throw new Error(assertion);
  }
}

/**
 * Asserts that a value of type `never` is never reached.
 * Useful for exhaustive checks in switch statements.
 *
 * @param value - The value that should never be reached.
 * @throws {Error} Always throws an error with the unhandled case message.
 */
export function assert_never(value: never): never {
  throw new Error('unhandled case ', value);
}

/**
 * Asserts that the given boolean value is `true`.
 * Throws an error with the provided assertion message if the check fails.
 *
 * @param value - The boolean value to check.
 * @param assertion - The error message to throw if the assertion fails.
 * @throws {Error} If `value` is `false`.
 */
export function assert_true(value: boolean, assertion: string): void {
  if (!value) {
    throw new Error(assertion);
  }
}

/**
 * Unwraps a potentially `null` or `undefined` value, ensuring it exists.
 * Throws an error with the provided assertion message if the value is `null` or `undefined`.
 *
 * @param value - The value to unwrap.
 * @param assertion - The error message to throw if the assertion fails.
 * @returns The unwrapped value.
 * @throws {Error} If `value` is `null` or `undefined`.
 */
export function unwrap<T>(value: T | null | undefined, assertion: string): T {
  assert_exists(value, assertion);
  return value as T;
}
