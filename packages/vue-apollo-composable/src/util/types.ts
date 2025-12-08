export type RenameKey<T, OldKey extends keyof T, NewKey extends string> = {
  [K in keyof T as K extends OldKey ? NewKey : K]: T[K]
}
