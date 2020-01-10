export type ExactType<T, U> = T extends U ? (U extends T ? T : never) : never;

/**
 * Verify that a type matches an exact expected type.
 *
 * NOTE: Some cases don't work (like `any`, `unknown`) due to how typescript
 * widens types. Manually verify the assert is reliable when using.
 */
export function assertExactType<TActual, TExpected>(expected: ExactType<TActual, TExpected>) {}
