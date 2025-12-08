[@vue/apollo-composable](../../../../index.md) / [useLazyQuery](../index.md) / Options

# Interface: Options

Options for useLazyQuery - same as useQuery but `enabled` is not applicable.

## 1. Operation options

### errorPolicy?

> `optional` **errorPolicy**: `ErrorPolicy`

Specifies how the query handles a response that returns both GraphQL errors and partial results.

For details, see [GraphQL error policies](https://www.apollographql.com/docs/react/data/error-handling/#graphql-error-policies).

The default value is `none`, meaning that the query result includes error details but not partial results.

***

### variables?

> `optional` **variables**: [`ReactiveVariablesParameter`](../../useQuery/type-aliases/ReactiveVariablesParameter.md)

An object containing all of the GraphQL variables your query requires to execute.

Each key in the object corresponds to a variable name, and that key's value corresponds to the variable value.

## 2. Networking options

### context?

> `optional` **context**: `DefaultContext`

If you're using [Apollo Link](https://www.apollographql.com/docs/react/api/link/introduction/), this object is the initial value of the `context` object that's passed along your link chain.

***

### notifyOnNetworkStatusChange?

> `optional` **notifyOnNetworkStatusChange**: `boolean`

If `true`, the next state event is emitted whenever the network status changes or a network error occurs.

***

### pollInterval?

> `optional` **pollInterval**: `number`

Specifies the interval (in milliseconds) at which the query polls for updated results.

#### Default

```ts
0 // (no polling)
```

***

### skipPollAttempt()?

> `optional` **skipPollAttempt**: () => `boolean`

A callback function that's called whenever a refetch attempt occurs
while polling. If the function returns `true`, the refetch is
skipped and not reattempted until the next poll interval.

#### Returns

`boolean`

## 3. Caching options

### fetchPolicy?

> `optional` **fetchPolicy**: `WatchQueryFetchPolicy`

Specifies how the query interacts with the Apollo Client cache during execution (for example, whether it checks the cache for results before sending a request to the server).

For details, see [Setting a fetch policy](https://www.apollographql.com/docs/react/data/queries/#setting-a-fetch-policy).

The default value is `cache-first`.

***

### initialFetchPolicy?

> `optional` **initialFetchPolicy**: `WatchQueryFetchPolicy`

Defaults to the initial value of options.fetchPolicy, but can be explicitly
configured to specify the WatchQueryFetchPolicy to revert back to whenever
variables change (unless nextFetchPolicy intervenes).

***

### nextFetchPolicy?

> `optional` **nextFetchPolicy**: `WatchQueryFetchPolicy` \| (`this`, `currentFetchPolicy`, `context`) => `WatchQueryFetchPolicy`

Specifies the `FetchPolicy` to be used after this query has completed.

***

### refetchWritePolicy?

> `optional` **refetchWritePolicy**: `RefetchWritePolicy`

Specifies whether a `NetworkStatus.refetch` operation should merge
incoming field data with existing data, or overwrite the existing data.
Overwriting is probably preferable, but merging is currently the default
behavior, for backwards compatibility with Apollo Client 3.x.

***

### returnPartialData?

> `optional` **returnPartialData**: `boolean`

If `true`, the query can return partial results from the cache if the cache doesn't contain results for all queried fields.

#### Default

```ts
false
```

## 4. Vue-Apollo

### awaitComplete?

> `optional` **awaitComplete**: `boolean`

Whether to await complete data before resolving. Use with `@stream` and `@defer` GraphQL directives.

Only affects SSR prefetch and `await useQuery()`.

#### Default

```ts
false
```

***

### clientId?

> `optional` **clientId**: `string`

ID of a named Apollo client to use instead of the default.

***

### debounce?

> `optional` **debounce**: `number`

Debounce variable updates (ms).

***

### keepPreviousResult?

> `optional` **keepPreviousResult**: `boolean`

Keep previous result while loading new data.

#### Default Value

```ts
false
```

***

### prefetch?

> `optional` **prefetch**: `boolean`

Whether to prefetch on server.

#### Default Value

```ts
true
```

***

### throttle?

> `optional` **throttle**: `number`

Throttle variable updates (ms).
