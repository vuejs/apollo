import { useApolloClient, UseApolloClientReturn } from '../../src'
import { assertExactType } from './assertions'

// =============================================================================
// With no type and no clientId
// - the store type should be `any`
// =============================================================================
{
  const noClientId = useApolloClient()
  noClientId.client?.extract(true).storeType.is.any
}

// =============================================================================
// With no type and a clientId
// - the store type should be `any`
// =============================================================================
{
  const withClientId = useApolloClient('88K2tP')
  withClientId.client?.extract(true).storeType.is.any
}

// =============================================================================
// With specific type and a client id
// - the store type should be the specified tyep
// =============================================================================
{
  const withType = useApolloClient<'cacheShape'>('38pX2d')
  const store = withType.client?.extract(true)

  assertExactType<typeof withType, UseApolloClientReturn<'cacheShape'>>(withType)
  assertExactType<typeof store, 'cacheShape' | undefined>(store)
}
