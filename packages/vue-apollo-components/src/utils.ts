/**
 * Layer the dedicated props over the `options` escape hatch.
 *
 * Only keys the caller passed are applied, so an absent prop cannot overwrite `options`.
 */
export function mergeOptions<TOptions extends object>(
  options: TOptions | undefined,
  overrides: Record<string, unknown>,
): TOptions {
  const merged: Record<string, unknown> = { ...options }

  for (const [key, value] of Object.entries(overrides)) {
    if (value !== undefined) {
      merged[key] = value
    }
  }

  return merged as TOptions
}
