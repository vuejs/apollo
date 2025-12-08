[@vue/apollo-composable](../../../../index.md) / [useApolloClient](../index.md) / Result

# Interface: Result

Result returned by useApolloClient.

## Properties

### client

> `readonly` **client**: [`ApolloClient`](https://www.apollographql.com/docs/react/api/core/ApolloClient)

The ApolloClient instance.

***

### resolveClient()

> **resolveClient**: (`clientId?`) => [`ApolloClient`](https://www.apollographql.com/docs/react/api/core/ApolloClient)

Resolves an ApolloClient by ID.

#### Parameters

##### clientId?

`string`

The client ID to resolve. If omitted, resolves the default client.

#### Returns

[`ApolloClient`](https://www.apollographql.com/docs/react/api/core/ApolloClient)

