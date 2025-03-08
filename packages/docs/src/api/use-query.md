# useQuery

## Parameters

- `document`: GraphQL document containing the query. Can also be a `Ref` or a function that returns the document (which will be reactive).

- `variables`: (default: `null`) Variables object. Can also be a `Ref`, a reactive object or a function that returns the variables object.

- `options`: (default: `null`) Options object. Can also be a `Ref`, a reactive object or a function that returns the options object.

  - `clientId`: Id of the client that should be used for this query if you have provided multiple clients.

  - `context`: Context to be passed to link execution chain.

  - `debounce`: Debounce interval in ms.

  - `enabled`: A boolean `Ref` to enable or disable the query.

  - `errorPolicy`: Customize error behavior. See [error handling](../guide-composable/error-handling).
    - `none`
    - `all`
    - `ignore`

  - `fetchPolicy`: Customize cache behavior.
    - `cache-first` (default): return result from cache. Only fetch from network if cached result is not available.
    - `cache-and-network`: return result from cache first (if it exists), then return network result once it's available.
    - `cache-only`: return result from cache if available, fail otherwise.
    - `network-only`: return result from network, fail if network call doesn't succeed, save to cache.
    - `no-cache`: return result from network, fail if network call doesn't succeed, don't save to cache.

  - `metadata`: Arbitrary metadata stored in the store with this query. Designed for debugging, developer tools, etc.

  - `notifyOnNetworkStatusChange`: Whether or not updates to the network status should trigger next on the observer of this query.

  - `prefetch`: (default: `true`) Enable prefetching on the server during Server-Side Rendering.

  - `pollInterval`: The time interval (in milliseconds) on which this query should be refetched from the server.

  - `returnPartialData`: Allow returning incomplete data from the cache when a larger query cannot be fully satisfied by the cache, instead of returning nothing.

  - `throttle`: Throttle interval in ms.

  - `keepPreviousResult`: (default: `false`) Whether or not to keep previous result when the query is fetch again (for example when a variable changes). This can be useful to prevent a flash of empty content.

## Return

- `result`: result data object.

- `loading`: Boolean Ref, `true` if the query is in flight.

- `error`: Error Ref, holding any occuring error.

- `variables`: Ref holding the variables object.

- `refetch(variables?)`: Execute the query again, optionally with new variables.

- `fetchMore(options)`: Execute a variant of the query to retrieve additional data to be merged with the existing one. Useful for [Pagination](../guide-composable/pagination).

- `subscribeToMore(options)`: Add a subscription to the query, useful to add new data received from the server in real-time. See [Subscription](../guide-composable/subscription#subscribetomore).

- `onResult(handler)`: Event hook called when a new result is available. Handler is called with: `result` (query result) and `context` which is an object with `client` (ApolloClient instance).

- `onError(handler)`: Event hook called when an error occurs. Handler is called with: `error` and `context` which is an object with `client` (ApolloClient instance).
