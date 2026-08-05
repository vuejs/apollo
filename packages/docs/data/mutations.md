# Mutations

A GraphQL mutation is a write request. Like a [query](/data/queries) it names the fields it wants back, so the server returns the updated object in the same round trip that changed it.

That return value is what makes mutations more than a POST. Apollo Client writes it into the same normalized cache your queries read from, so a mutation that returns the entity it modified updates every query already showing it, with no refetch and no manual invalidation.

## Executing a mutation

:::: composition-api
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
::::

:::: components-api
`<ApolloMutation>` is renderless: it has one slot, and nothing happens until you call
`mutate` from it.

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ createTodo: { id: string, text: string } }, { text: string }>
// ---cut---
import { ApolloMutation } from '@vue/apollo-components'
import { ref } from 'vue'

const text = ref('')
</script>

<template>
  <ApolloMutation
    v-slot="{ mutate, loading, error }"
    :mutation="gql`
      mutation CreateTodo($text: String!) {
        createTodo(text: $text) {
          id
          text
        }
      }
    `"
  >
    <form @submit.prevent="mutate({ variables: { text } }).then(() => (text = '')).catch(console.error)">
      <input v-model="text">
      <button :disabled="loading">
        {{ loading ? 'Adding...' : 'Add Todo' }}
      </button>
    </form>
    <p v-if="error">
      Error: {{ error.message }}
    </p>
  </ApolloMutation>
</template>
```

Nothing is listening for `@error` here, so `mutate()` rejects on failure: the chain needs a
`.catch`, and the input is cleared only when the mutation actually succeeded. Bind `@error`
instead and `mutate()` resolves, with the failure arriving on the event. See
[Error throwing behavior](#error-throwing-behavior).

The slot gives you the same surface `useMutation` returns, with the refs unwrapped:

- `mutate(options?)` triggers the mutation and returns a promise resolving to the result.
- `loading` is `true` while the mutation is in flight.
- `error` contains any error from the mutation.
- `called` is `true` once `mutate` has been called at least once.
- `result` holds the most recent mutation result data.
- `reset()` clears `result`, `error` and `called`.
::::

## Variables

:::: composition-api
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
::::

:::: components-api
Pass variables when calling `mutate` from the slot:

```vue-html
<button @click="mutate({ variables: { text: 'Buy groceries' } })">
```

Or declare them once on the component, for variables that are the same on every call:

```vue-html
<ApolloMutation :mutation="CreateTodo" :variables="{ text }">
```

When both are present the call-time variables win, merged on top of the prop.
::::

## Tracking mutation status

:::: composition-api
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
::::

:::: components-api
Use the `loading`, `error` and `called` slot props to track state in your template:

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'

declare const Login: TypedDocumentNode<{ login: { token: string } }, { email: string, password: string }>
// ---cut---
import { ApolloMutation } from '@vue/apollo-components'
</script>

<template>
  <ApolloMutation v-slot="{ loading, error, called }" :mutation="Login">
    <div v-if="loading">
      Logging in...
    </div>
    <div v-else-if="error">
      Login failed: {{ error.message }}
    </div>
    <div v-else-if="called">
      Login successful.
    </div>
  </ApolloMutation>
</template>
```
::::

## Resetting state

:::: composition-api
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
::::

:::: components-api
`reset()` is a slot prop, next to the `error` it clears:

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ login: { token: string } }, { email: string, password: string }>
// ---cut---
import { ApolloMutation } from '@vue/apollo-components'
</script>

<template>
  <ApolloMutation
    v-slot="{ error, reset }"
    :mutation="gql`
      mutation Login($email: String!, $password: String!) {
        login(email: $email, password: $password) {
          token
        }
      }
    `"
  >
    <div v-if="error" class="error">
      {{ error.message }}
      <button @click="reset()">
        Dismiss
      </button>
    </div>
  </ApolloMutation>
</template>
```
::::

## Updating cached data after a mutation

A successful mutation often invalidates queries that read the same data. Apollo Client offers several ways to keep the cache in sync:

1. **Return the modified entity from the mutation.** If your mutation result includes the full entity (with `__typename` and the key field), Apollo's normalized cache updates every query that reads that entity automatically. This is the simplest case and requires no extra wiring.
2. **`refetchQueries`** re-runs specific queries on the server after the mutation completes.
3. **The `update` function** lets you modify the cache directly so the UI updates without another network round trip.

See [Cache Updates](/caching/cache-updates) for the full guide. Quick examples below.

:::: components-api
`<ApolloMutation>` has props only for `mutation`, `variables` and `clientId`. Everything
else, including both options below, goes through the `options` prop, which takes the full
[`useMutation.Options`](/api/composable/@vue/namespaces/useMutation/interfaces/Options)
object.
::::

### Refetching queries

:::: composition-api
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
::::

:::: components-api
```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ createTodo: { id: string } }, { text: string }>
declare const GetTodos: TypedDocumentNode<{ todos: { id: string }[] }, Record<string, never>>
// ---cut---
import { ApolloMutation } from '@vue/apollo-components'
</script>

<template>
  <ApolloMutation
    v-slot="{ mutate }"
    :mutation="gql`
      mutation CreateTodo($text: String!) {
        createTodo(text: $text) {
          id
        }
      }
    `"
    :options="{
      refetchQueries: [
        GetTodos, // by document
        'GetTodos', // or by operation name
      ],
    }"
  >
    <button @click="mutate({ variables: { text: 'Buy groceries' } }).catch(console.error)">
      Add
    </button>
  </ApolloMutation>
</template>
```
::::

### `update` function

For more control, use `update` to modify the cache directly:

:::: composition-api
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
::::

:::: components-api
```vue twoslash
<script setup lang="ts">
import { ApolloCache, TypedDocumentNode } from '@apollo/client'

declare const CreateTodo: TypedDocumentNode<{ createTodo: { id: string, text: string } }, { text: string }>
declare const GetTodos: TypedDocumentNode<{ todos: { id: string, text: string }[] }, Record<string, never>>
// ---cut---
import { ApolloMutation } from '@vue/apollo-components'

function addToList(cache: ApolloCache, { data }: { data?: { createTodo: { id: string, text: string } } | null }) {
  if (!data?.createTodo)
    return

  const existing = cache.readQuery({ query: GetTodos })
  if (!existing)
    return

  cache.writeQuery({
    query: GetTodos,
    data: { todos: [...existing.todos, data.createTodo] },
  })
}
</script>

<template>
  <ApolloMutation v-slot="{ mutate }" :mutation="CreateTodo" :options="{ update: addToList }">
    <button @click="mutate({ variables: { text: 'Buy groceries' } }).catch(console.error)">
      Add
    </button>
  </ApolloMutation>
</template>
```
::::

## Optimistic UI

Provide an `optimisticResponse` to update the UI immediately, before the server responds:

:::: composition-api
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
::::

:::: components-api
`optimisticResponse` belongs to the call, not the component, so it goes to `mutate()` from
the slot alongside the variables:

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ createTodo: { __typename: 'Todo', id: string, text: string, completed: boolean } }, { text: string }>
// ---cut---
import { ApolloMutation } from '@vue/apollo-components'

const text = 'Buy groceries'

const optimisticResponse = {
  createTodo: {
    __typename: 'Todo' as const,
    id: 'temp-id',
    text,
    completed: false,
  },
}
</script>

<template>
  <ApolloMutation
    v-slot="{ mutate }"
    :mutation="gql`
      mutation CreateTodo($text: String!) {
        createTodo(text: $text) {
          id
          text
          completed
        }
      }
    `"
  >
    <button @click="mutate({ variables: { text }, optimisticResponse }).catch(console.error)">
      Add
    </button>
  </ApolloMutation>
</template>
```
::::

Apollo Client writes the optimistic response into the cache immediately, fires your `update` function with it, then replaces it with the real result when the server responds. See [Optimistic UI](/caching/optimistic-ui) for the full pattern, including rollback on error.

## Event hooks

:::: composition-api
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

::: tip Registering `onError` stops `mutate()` throwing
Under the default `throws: 'auto'`, `mutate()` rejects only while nothing is listening. The
first `onError` handler you register flips it: the failure goes to the handler and the
promise resolves, so an `await mutate(...)` followed by navigation no longer sees it.

Calling `off()` on the handle `onError` returns restores the throwing behaviour. To decouple
the two entirely, set `throws` yourself; see
[Error throwing behavior](#error-throwing-behavior).
:::
::::

:::: components-api
`onDone` and `onError` are emitted as `@done` and `@error`:

```vue
<script setup lang="ts">
import { ApolloMutation } from '@vue/apollo-components'
import { CreateTodo } from './mutations'
</script>

<template>
  <ApolloMutation
    v-slot="{ mutate }"
    :mutation="CreateTodo"
    @done="result => console.log('Todo created:', result.data?.createTodo)"
    @error="error => console.error('Failed to create todo:', error)"
  >
    <button @click="mutate({ variables: { text: 'Buy groceries' } })">
      Add
    </button>
  </ApolloMutation>
</template>
```

Binding `@error` also stops `mutate()` throwing, exactly as registering `onError` does on the
composable; see [Error throwing behavior](#error-throwing-behavior).
::::

## Error throwing behavior

:::: composition-api
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
::::

:::: components-api
By default, `mutate()` throws if nothing is listening for `@error`. Binding the event
counts as registering a handler, so the failure surfaces there instead of as a rejection:

```vue-html
<!-- mutate() rejects; handle it at the call site -->
<ApolloMutation v-slot="{ mutate }" :mutation="CreateTodo">
  <button @click="mutate().catch(showToast)">Add</button>
</ApolloMutation>

<!-- mutate() resolves; the failure arrives on @error -->
<ApolloMutation :mutation="CreateTodo" @error="showToast" />
```

`throws` has no dedicated prop; set it through `options`:

```vue-html
<ApolloMutation :mutation="CreateTodo" :options="{ throws: 'always' }" />
```

| Value | Behavior |
|-------|----------|
| `'auto'` | Throws unless `@error` is bound, or a handler was registered via a template ref **(default)** |
| `'always'` | Always throws |
| `'never'` | Never throws; read the `error` slot prop |

::: tip
The component bridges `@error` to `onError` only while the parent is actually listening, so
`throws: 'auto'` means exactly what it means in `useMutation`. It re-checks between renders,
so a listener bound conditionally is picked up when it appears.
:::
::::

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
