# Mutations

This page shows how to update data with the [`useMutation`](/api/composable/functions/useMutation) composable.

## Executing a Mutation

Unlike [`useQuery`](/api/composable/functions/useQuery), [`useMutation`](/api/composable/functions/useMutation) doesn't execute automatically. Instead, it returns a `mutate` function that you call to trigger the mutation:

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'
import { useMutation } from '@vue/apollo-composable'
import { ref } from 'vue'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ createTodo: { id: string, text: string } }, { text: string }>
// ---cut---
const text = ref('')

const { mutate, loading, error } = useMutation(gql`
  mutation CreateTodo($text: String!) {
    createTodo(text: $text) {
      id
      text
    }
  }
`)

async function handleSubmit() {
  await mutate({ variables: { text: text.value } })
  text.value = ''
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <input v-model="text">
    <button :disabled="loading">
      {{ loading ? 'Adding...' : 'Add Todo' }}
    </button>
  </form>
  <p v-if="error">
    Error: {{ error.message }}
  </p>
</template>
```

The [`useMutation`](/api/composable/functions/useMutation) composable returns:

- `mutate` - A function to execute the mutation
- `loading` - A ref indicating if the mutation is in flight
- `error` - A ref containing any error that occurred
- `called` - A ref indicating if the mutation has been called
- `result` - A ref containing the mutation result

## Variables

Pass variables when calling `mutate`:

```ts twoslash
import { TypedDocumentNode } from '@apollo/client'
import { useMutation } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ createTodo: { id: string } }, { text: string }>
const CREATE_TODO = gql``
// ---cut---
const { mutate } = useMutation(CREATE_TODO)

// Pass variables when executing
mutate({ variables: { text: 'Buy groceries' } })
```

You can also provide reactive variables in the options instead of passing them to `mutate`:

```ts twoslash
import { TypedDocumentNode } from '@apollo/client'
import { useMutation } from '@vue/apollo-composable'
import { ref } from 'vue'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ createTodo: { id: string } }, { text: string }>
const CREATE_TODO = gql``
// ---cut---
const text = ref('')

const { mutate } = useMutation(CREATE_TODO, {
  variables: {
    text, // Reactive - uses current value when mutate() is called
  },
})

// Call without variables - uses reactive variables from options
mutate()
```

## Tracking Mutation Status

Use `loading`, `error`, and `called` to track the mutation state:

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'
import { useMutation } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ login: { token: string } }, { email: string, password: string }>
const LOGIN = gql``
// ---cut---
const { mutate, loading, error, called } = useMutation(LOGIN)
</script>

<template>
  <div v-if="loading">
    Logging in...
  </div>
  <div v-else-if="error">
    Login failed: {{ error.message }}
  </div>
  <div v-else-if="called">
    Login successful!
  </div>
</template>
```

## Resetting State

Reset the mutation state with the `reset` function:

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'
import { useMutation } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ login: { token: string } }, { email: string, password: string }>
const LOGIN = gql``
// ---cut---
const { mutate, error, reset } = useMutation(LOGIN)

function dismissError() {
  reset() // Clears error and resets called state
}
</script>

<template>
  <div v-if="error" class="error">
    {{ error.message }}
    <button @click="dismissError">
      Dismiss
    </button>
  </div>
</template>
```

## Updating Cached Data

After a mutation, you often need to update the cached data. There are two approaches:

### Refetching Queries

Use `refetchQueries` to refetch specific queries after the mutation:

```ts twoslash
import { TypedDocumentNode } from '@apollo/client'
import { useMutation } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ createTodo: { id: string } }, { text: string }>
const CREATE_TODO = gql``
declare const GET_TODOS: TypedDocumentNode<{ todos: { id: string }[] }, {}>
// ---cut---
const { mutate } = useMutation(CREATE_TODO, {
  refetchQueries: [
    GET_TODOS, // DocumentNode
    'GetTodos', // Query name as string
  ],
})
```

### The `update` Function

For more control, use the `update` function to manually modify the cache:

```ts twoslash
import { TypedDocumentNode } from '@apollo/client'
import { useMutation } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ createTodo: { id: string, text: string } }, { text: string }>
const CREATE_TODO = gql``
declare const GET_TODOS: TypedDocumentNode<{ todos: { id: string, text: string }[] }, {}>
// ---cut---
const { mutate } = useMutation(CREATE_TODO, {
  update(cache, { data }) {
    // Read the current todos from cache
    const existing = cache.readQuery({ query: GET_TODOS })

    if (existing && data?.createTodo) {
      // Write back with the new todo added
      cache.writeQuery({
        query: GET_TODOS,
        data: {
          todos: [...existing.todos, data.createTodo],
        },
      })
    }
  },
})
```

Learn more about cache updates in [Cache Updates](/caching/cache-updates).

## Optimistic UI

Provide an `optimisticResponse` to update the UI immediately before the server responds:

```ts twoslash
import { TypedDocumentNode } from '@apollo/client'
import { useMutation } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ createTodo: { __typename: 'Todo', id: string, text: string, completed: boolean } }, { text: string }>
const CREATE_TODO = gql``
// ---cut---
const { mutate } = useMutation(CREATE_TODO)

mutate({
  variables: { text: 'Buy groceries' },
  optimisticResponse: {
    createTodo: {
      __typename: 'Todo',
      id: 'temp-id',
      text: 'Buy groceries',
      completed: false,
    },
  },
})
```

The optimistic response is used immediately, then replaced with the real data when the server responds. Learn more in [Optimistic UI](/caching/optimistic-ui).

## Event Hooks

React to mutation lifecycle events:

```ts twoslash
import { TypedDocumentNode } from '@apollo/client'
import { useMutation } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ createTodo: { id: string } }, { text: string }>
const CREATE_TODO = gql``
// ---cut---
const { mutate, onDone, onError } = useMutation(CREATE_TODO)

onDone((result) => {
  console.log('Todo created:', result.data?.createTodo)
})

onError((error) => {
  console.error('Failed to create todo:', error)
})
```

## Error Handling

By default, `useMutation` throws errors when no `onError` handler is registered. Control this with the `throws` option:

```ts twoslash
import { TypedDocumentNode } from '@apollo/client'
import { useMutation } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ createTodo: { id: string } }, { text: string }>
const CREATE_TODO = gql``
// ---cut---
const { mutate } = useMutation(CREATE_TODO, {
  throws: 'never', // Never throw, check error ref instead
})

// Or use try/catch with throws: 'always'
const { mutate: mutateWithThrow } = useMutation(CREATE_TODO, {
  throws: 'always',
})

try {
  await mutateWithThrow({ variables: { text: 'test' } })
}
catch (e) {
  console.error('Mutation failed:', e)
}
```

| Value | Behavior |
|-------|----------|
| `'auto'` | Throws if no `onError` handler is registered **(default)** |
| `'always'` | Always throws errors |
| `'never'` | Never throws, use `error` ref instead |

## Next Steps

- [Cache Updates](/caching/cache-updates) - Learn how to update the cache after mutations
- [Optimistic UI](/caching/optimistic-ui) - Improve perceived performance with optimistic updates
- [Error Handling](/data/error-handling) - Handle errors gracefully
