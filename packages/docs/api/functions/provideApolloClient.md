[@vue/apollo-composable](../index.md) / provideApolloClient

# Function: provideApolloClient()

> **provideApolloClient**(`client`): [`Result`](../@vue/namespaces/provideApolloClient/type-aliases/Result.md)

Provides an ApolloClient for use outside Vue's injection context.

## Parameters

### client

[`ApolloClient`](https://www.apollographql.com/docs/react/api/core/ApolloClient)

The ApolloClient instance to provide.

## Returns

[`Result`](../@vue/namespaces/provideApolloClient/type-aliases/Result.md)

A function that executes a callback with the client available.

## Example

```ts
const { current } = provideApolloClient(client)(() => {
  return useQuery(MyQuery)
})
```
