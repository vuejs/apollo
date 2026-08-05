export const API_FLAVORS = [
  { value: 'composition', label: 'Composition API' },
  { value: 'components', label: 'Components API' },
] as const

export type ApiFlavor = typeof API_FLAVORS[number]['value']

export const DEFAULT_FLAVOR: ApiFlavor = 'composition'

export const STORAGE_KEY = 'vue-apollo:api-flavor'

export function isApiFlavor(value: unknown): value is ApiFlavor {
  return API_FLAVORS.some(flavor => flavor.value === value)
}
