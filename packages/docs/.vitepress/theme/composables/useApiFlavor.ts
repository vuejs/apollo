import type { ApiFlavor } from '../../apiFlavors.ts'
import { createSharedComposable, useLocalStorage } from '@vueuse/core'
import { watch } from 'vue'
import { API_FLAVORS, DEFAULT_FLAVOR, isApiFlavor, STORAGE_KEY } from '../../apiFlavors.ts'

/** Nothing rendered depends on this. It drives `aria-checked` and the click handler. */
function useApiFlavorState() {
  const flavor = useLocalStorage<ApiFlavor>(STORAGE_KEY, DEFAULT_FLAVOR, {
    // Read after hydration, so the first client render matches the server's default.
    initOnMounted: true,
    listenToStorageChanges: false,
    serializer: {
      read: raw => (isApiFlavor(raw) ? raw : DEFAULT_FLAVOR),
      write: value => value,
    },
  })

  // Deliberately not `immediate`: the `head` script already applied the stored flavor
  watch(flavor, (value) => {
    for (const { value: candidate } of API_FLAVORS) {
      document.documentElement.classList.toggle(`api-pref-${candidate}`, candidate === value)
    }
  })

  return flavor
}

export const useApiFlavor = createSharedComposable(useApiFlavorState)
