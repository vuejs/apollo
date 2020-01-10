/**
 * Check if a type is a union, and return true if so, otherwise false.
 */
export type IsUnion<T, U = T> = U extends any ? ([T] extends [U] ? false : true) : never

/**
 * Extracts an inner type if T has a single key K, otherwise it returns T.
 */
export type ExtractSingleKey<T, K extends keyof T = keyof T> = IsUnion<K> extends true ? T : T[K]
