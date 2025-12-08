[@vue/apollo-composable](../index.md) / useFragment

# Function: useFragment()

> **useFragment**(`options`): [`Result`](../@vue/namespaces/useFragment/interfaces/Result.md)

A composable for reading fragment data from the Apollo cache with full reactivity.

Watches fragment data and automatically updates when the cache changes. Supports both single entities and arrays of entities.

::: danger Note

This only works for data that can be identified by the cache via `cache.identify()`. Entities must have a unique cache ID (typically `__typename` + `id`).

:::

## Parameters

### options

[`Options`](../@vue/namespaces/useFragment/interfaces/Options.md)

Configuration options for the fragment.

## Returns

[`Result`](../@vue/namespaces/useFragment/interfaces/Result.md)

Fragment result object with reactive refs.

## Example

```ts
const { current } = useFragment({
  fragment: gql`fragment UserFields on User { id name }`,
  from: { __typename: 'User', id: '1' },
})
```

## See

 - [Apollo Client watchFragment API](https://www.apollographql.com/docs/react/api/cache/InMemoryCache#watchfragment)
 - [Obtaining an object's cache ID](https://www.apollographql.com/docs/react/caching/cache-interaction#obtaining-an-objects-cache-id)
