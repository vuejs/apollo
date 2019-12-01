# useSubscription

## Parameters

- `document`: GraphQL document containing the subscription. Can also be a `Ref` or a function that returns the document (which will be reactive).

- `variables`: (default: `null`) Variables object. Can also be a `Ref`, a reactive object or a function that returns the variables object.

- `options`: (default: `null`) Options object. Can also be a `Ref`, a reactive object or a function that returns the options object.

  - `clientId`: Id of the client that should be used for this subscription if you have provided multiple clients.

  - `enabled`: A boolean `Ref` to enable or disable the subscription.

  - `fetchPolicy`: Customize cache behavior.
    - `cache-first` (default): return result from cache. Only fetch from network if cached result is not available.
    - `cache-and-network`: return result from cache first (if it exists), then return network result once it's available.
    - `cache-only`: return result from cache if available, fail otherwise.
    - `network-only`: return result from network, fail if network call doesn't succeed, save to cache.
    - `no-cache`: return result from network, fail if network call doesn't succeed, don't save to cache.

## Return

- `result`: result data object.

- `loading`: Boolean Ref, `true` if the subscription is in flight.

- `error`: Error Ref, holding any occuring error.

- `variables`: Ref holding the variables object.

- `onResult(handler)`: Event hook called when a new result is available.

- `onError(handler)`: Event hook called when an error occurs.

