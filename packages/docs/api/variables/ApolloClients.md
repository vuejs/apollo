[@vue/apollo-composable](../index.md) / ApolloClients

# Variable: ApolloClients

> `const` **ApolloClients**: unique `symbol`

Vue injection key for providing multiple named ApolloClient instances.

## Example

```ts
// In a plugin or main.ts
app.provide(ApolloClients, {
  default: mainClient,
  analytics: analyticsClient,
})

// In a parent component
provide(ApolloClients, {
  default: mainClient,
  analytics: analyticsClient,
})

// In a child component
const clients = inject(ApolloClients)
```
