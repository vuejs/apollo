# Mutations

This page covers updating data with the [`useMutation`](/api/composable/functions/useMutation) composable.

## Executing a mutation

Unlike [`useQuery`](/data/queries), `useMutation` does not execute automatically. It returns a `mutate` function that you call when you want the mutation to run:

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

`useMutation` returns the following refs and helpers:

- `mutate(options?)` triggers the mutation, returns a promise resolving to the result.
- `loading` is `true` while the mutation is in flight.
- `error` contains any error from the mutation.
- `called` is `true` once `mutate` has been called at least once.
- `result` holds the most recent mutation result data.
- `reset()` resets `result`, `error`, `loading`, and `called` to their initial state.

::: tip Why flat refs and not `current`?
`useMutation` does not expose a `current` discriminated union the way `useQuery` does. A mutation is request-response: it does not have streaming or partial states. Using individual refs keeps the API close to how you naturally consume a mutation. See [TypeScript](/data/typescript#composable-return-value-shapes) for the comparison.
:::

## Variables

The most common pattern is to pass variables when calling `mutate`:

```ts twoslash
import { TypedDocumentNode } from '@apollo/client'
import { useMutation } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ createTodo: { id: string } }, { text: string }>
const CREATE_TODO = gql``
// ---cut---
const { mutate } = useMutation(CREATE_TODO)

mutate({ variables: { text: 'Buy groceries' } })
```

You can also declare reactive variables in the composable options. They are resolved each time `mutate` is called:

```ts twoslash
import { TypedDocumentNode } from '@apollo/client'
import { useMutation } from '@vue/apollo-composable'
import { ref } from 'vue'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ createTodo: { id: string } }, { text: string }>
const CREATE_TODO = gql``
// ---cut---
const text = ref('')

const { mutate } = useMutation(CREATE_TODO, {
  variables: { text }, // Resolved on each mutate() call
})

// No variables needed; uses current text.value
mutate()
```

When variables come from both composable options and the `mutate` call, the call-time variables win, merged on top of the composable variables.

## Tracking mutation status

Use `loading`, `error`, and `called` to track state in your template:

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
    Login successful.
  </div>
</template>
```

## Resetting state

`reset()` clears `result`, `error`, and `called` so the mutation looks fresh:

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'
import { useMutation } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ login: { token: string } }, { email: string, password: string }>
const LOGIN = gql``
// ---cut---
const { mutate, error, reset } = useMutation(LOGIN)

function dismissError() {
  reset()
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

## Updating cached data after a mutation

A successful mutation often invalidates queries that read the same data. Apollo Client offers several ways to keep the cache in sync:

1. **Return the modified entity from the mutation.** If your mutation result includes the full entity (with `__typename` and the key field), Apollo's normalized cache updates every query that reads that entity automatically. This is the simplest case and requires no extra wiring.
2. **`refetchQueries`** re-runs specific queries on the server after the mutation completes.
3. **The `update` function** lets you modify the cache directly so the UI updates without another network round trip.

See [Cache Updates](/caching/cache-updates) for the full guide. Quick examples below.

### Refetching queries

```ts twoslash
import { TypedDocumentNode } from '@apollo/client'
import { useMutation } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ createTodo: { id: string } }, { text: string }>
const CREATE_TODO = gql``
declare const GET_TODOS: TypedDocumentNode<{ todos: { id: string }[] }, {}>
// ---cut---
const { mutate } = useMutation(CREATE_TODO, {
  refetchQueries: [
    GET_TODOS, // by document
    'GetTodos', // or by operation name
  ],
})
```

### `update` function

For more control, use `update` to modify the cache directly:

```ts twoslash
import { TypedDocumentNode } from '@apollo/client'
import { useMutation } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ createTodo: { id: string, text: string } }, { text: string }>
const CREATE_TODO = gql``
declare const GET_TODOS: TypedDocumentNode<{ todos: { id: string, text: string }[] }, {}>
// ---cut---
const { mutate } = useMutation(CREATE_TODO, {
  update(cache, { data }) {
    if (!data?.createTodo)
      return

    const existing = cache.readQuery({ query: GET_TODOS })
    if (!existing)
      return

    cache.writeQuery({
      query: GET_TODOS,
      data: { todos: [...existing.todos, data.createTodo] },
    })
  },
})
```

## Optimistic UI

Provide an `optimisticResponse` to update the UI immediately, before the server responds:

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

Apollo Client writes the optimistic response into the cache immediately, fires your `update` function with it, then replaces it with the real result when the server responds. See [Optimistic UI](/caching/optimistic-ui) for the full pattern, including rollback on error.

## Event hooks

React to mutation outcomes imperatively:

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

## Error throwing behavior

By default, `mutate()` throws errors if no `onError` handler is registered. The `throws` option controls this:

```ts twoslash
import { TypedDocumentNode } from '@apollo/client'
import { useMutation } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ createTodo: { id: string } }, { text: string }>
const CREATE_TODO = gql``
// ---cut---
// Never throw, check the error ref instead
const { mutate, error } = useMutation(CREATE_TODO, { throws: 'never' })

// Always throw, use try/catch
const { mutate: createWithThrow } = useMutation(CREATE_TODO, { throws: 'always' })

try {
  await createWithThrow({ variables: { text: 'test' } })
}
catch (e) {
  console.error('Mutation failed:', e)
}
```

| Value | Behavior |
|-------|----------|
| `'auto'` | Throws if no `onError` handler is registered **(default)** |
| `'always'` | Always throws |
| `'never'` | Never throws; check the `error` ref |

## Multiple calls in flight

If you call `mutate()` again while a previous call is still pending, Vue Apollo ignores the older response. Only the most recent call updates `result` and `error`. The earlier promise still settles with its own result, so awaiters of the earlier call see what they expect.

## Options and result reference

For every available option and method, see:

- [`useMutation.Options`](/api/composable/@vue/namespaces/useMutation/interfaces/Options)
- [`useMutation.Result`](/api/composable/@vue/namespaces/useMutation/interfaces/Result)

## Next steps

- [Cache Updates](/caching/cache-updates) keeps queries in sync after mutations.
- [Optimistic UI](/caching/optimistic-ui) improves perceived performance.
- [Error Handling](/data/error-handling) handles mutation failures comprehensively.
