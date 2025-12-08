[@vue/apollo-composable](../index.md) / useApolloClient

# Function: useApolloClient()

> **useApolloClient**(`clientId?`): [`Result`](../@vue/namespaces/useApolloClient/interfaces/Result.md)

Composable to access ApolloClient instances.

Must be provided using [DefaultApolloClient](../variables/DefaultApolloClient.md) or [ApolloClients](../variables/ApolloClients.md). Alternatively, can be used inside a [provideApolloClient](../@vue/namespaces/provideApolloClient/index.md) or [provideApolloClients](../@vue/namespaces/provideApolloClients/index.md) context.

## Parameters

### clientId?

`string`

Client ID to resolve. Defaults to the default client.

## Returns

[`Result`](../@vue/namespaces/useApolloClient/interfaces/Result.md)

Object with `client` property.

## Example

```ts
// Get the default client
const { client } = useApolloClient()

// Get a named client
const { client } = useApolloClient('analytics')
```
