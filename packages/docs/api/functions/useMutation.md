[@vue/apollo-composable](../index.md) / useMutation

# Function: useMutation()

> **useMutation**(`mutation`, `options?`): [`Result`](../@vue/namespaces/useMutation/interfaces/Result.md)

A composable for executing GraphQL mutations.

## Parameters

### mutation

[`MaybeRefOrGetter`](https://vuejs.org/api/utility-types.html#maybereforgetter)\<`DocumentNode`\>

A GraphQL mutation document.

### options?

[`MaybeRefOrGetter`](https://vuejs.org/api/utility-types.html#maybereforgetter)\<[`Options`](../@vue/namespaces/useMutation/interfaces/Options.md)\>

Options to control how the mutation is executed.

## Returns

[`Result`](../@vue/namespaces/useMutation/interfaces/Result.md)

Mutation result object with reactive refs and mutate function.

## Example

```vue
<script setup lang="ts">
import { useMutation } from '@vue/apollo-composable'
import gql from 'graphql-tag'

const AddTodo = gql`mutation AddTodo($text: String!) { addTodo(text: $text) { id text } }`

const { mutate, loading, error, onDone, onError } = useMutation(AddTodo)

onDone((result) => {
  console.log('Todo added:', result.data)
})

onError((error) => {
  console.error('Failed:', error.message)
})

async function addTodo(text: string) {
  await mutate({ variables: { text } })
}
</script>

<template>
  <button :disabled="loading" @click="addTodo('New task')">
    {{ loading ? 'Adding...' : 'Add Todo' }}
  </button>
  <p v-if="error">
    Error: {{ error.message }}
  </p>
</template>
```
