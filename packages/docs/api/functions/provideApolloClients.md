[@vue/apollo-composable](../index.md) / provideApolloClients

# Function: provideApolloClients()

> **provideApolloClients**(`clients`): [`Result`](../@vue/namespaces/provideApolloClients/type-aliases/Result.md)

Provides multiple named ApolloClient instances for use outside Vue's injection context.

## Parameters

### clients

`useApolloClient.ClientDict`

Dictionary mapping client IDs to ApolloClient instances.

## Returns

[`Result`](../@vue/namespaces/provideApolloClients/type-aliases/Result.md)

A function that executes a callback with the clients available.

## Example

```ts
const { current } = provideApolloClients({
  default: mainClient,
  analytics: analyticsClient,
})(() => {
  return useQuery(MyQuery, { clientId: 'analytics' })
})
```
