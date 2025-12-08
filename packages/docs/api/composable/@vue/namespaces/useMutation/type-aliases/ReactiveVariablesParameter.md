[@vue/apollo-composable](../../../../index.md) / [useMutation](../index.md) / ReactiveVariablesParameter

# Type Alias: ReactiveVariablesParameter

> **ReactiveVariablesParameter** = [`MaybeRefOrGetter`](https://vuejs.org/api/utility-types.html#maybereforgetter)\<`OperationVariables`\> \| `Record`\<`string`, [`MaybeRefOrGetter`](https://vuejs.org/api/utility-types.html#maybereforgetter)\<`any`\>\>

Type for the `variables` option parameter: either a ref/getter of the full variables object, or an object mapping individual variable names to refs/getters.

## Example

```ts
// Single ref/getter for all variables
const variables = reactive({ text: 'Hello' })
useMutation(mutation, { variables })

// Object mapping individual variable names to refs/getters
const text = ref('Hello')
useMutation(mutation, { variables: { text } })
```
