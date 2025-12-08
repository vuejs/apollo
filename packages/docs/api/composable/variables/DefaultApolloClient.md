[@vue/apollo-composable](../index.md) / DefaultApolloClient

# Variable: DefaultApolloClient

> `const` **DefaultApolloClient**: unique `symbol`

Vue injection key for providing a single default ApolloClient.

## Example

```ts
// In a plugin or main.ts
app.provide(DefaultApolloClient, apolloClient)

// In a parent component
provide(DefaultApolloClient, apolloClient)

// In a child component
const client = inject(DefaultApolloClient)
```
