# Lazy Queries

[`useLazyQuery`](/api/composable/functions/useLazyQuery) is for queries where the variables are not known up front. Reach for it when a query should run in response to a user action (search submit, button click, modal open) rather than automatically on mount.

:::: components-api
::: warning Composition API only
There is no `<ApolloLazyQuery>`.
:::
::::

## When to use lazy vs enabled

| Situation | Tool |
|-----------|------|
| Variables come from a user action (search box submit, button click) | `useLazyQuery` |
| Variables are known but you want to gate execution on a condition | `useQuery({ enabled })` |
| Variables are known and the query should run on mount | `useQuery` |

`useLazyQuery` starts disabled. It exposes a `load(variables?)` function that you call when ready. After the first `load`, the query behaves like a normal `useQuery`: variables become reactive, results update, and the query stops when the scope is disposed.

## Basic usage

```vue
<script setup lang="ts">
const SEARCH_USERS: TypedDocumentNode<{ users: { id: string, name: string }[] }, { term: string }>
  = gql`
    query SearchUsers($term: String!) {
      users(search: $term) {
        id
        name
      }
    }
  `

const term = ref('')
const { load, current } = useLazyQuery(SEARCH_USERS)

async function search() {
  const result = await load({ term: term.value })
  console.log('Found users:', result?.users)
}
</script>

<template>
  <form @submit.prevent="search">
    <input v-model="term">
    <button>Search</button>
  </form>

  <div v-if="current.loading">
    Searching...
  </div>
  <ul v-else-if="current.resultState === 'complete'">
    <li v-for="user in current.result.users" :key="user.id">
      {{ user.name }}
    </li>
  </ul>
</template>
```

`load(variables?)`:

- Sets the variables for the query (merged with any variables already in options).
- Starts the query.
- Returns a promise that resolves with the result data when the query completes, or rejects with the error.

The result also lands in `current.result` and the individual refs (`result`, `loading`, `error`) just like `useQuery`.

## Loading multiple times

Calling `load` again with different variables re-runs the query:

```ts
const { load } = useLazyQuery(SEARCH_USERS)

await load({ term: 'alice' }) // First search
await load({ term: 'bob' }) // New search
```

Each call merges new variables on top of the previously-loaded ones.

## Options

`useLazyQuery` accepts the same options as `useQuery` (variables, fetch policies, error handling, etc.), except `enabled` is not applicable (the query is always lazy until `load` is called).

You can still set reactive `variables` in options, which acts as the default for `load`:

```ts
const term = ref('')
const limit = ref(10)

const { load } = useLazyQuery(SEARCH_USERS, {
  variables: { term, limit },
})

// Uses the reactive variables from options
async function search() {
  await load()
}

// Or override on the call
async function searchOne() {
  await load({ term: term.value, limit: 1 })
}
```

After the first `load`, changes to the reactive variables trigger re-execution like any normal `useQuery`.

## Awaiting the result

`load` returns a promise so you can use the result inline:

```ts
async function fetchUser(id: string) {
  try {
    const data = await load({ id })
    if (data) {
      console.log('Loaded:', data.user)
    }
  }
  catch (e) {
    console.error('Failed to load:', e)
  }
}
```

The promise resolves with the query data when the result is complete. If the query errors, it rejects with the error. The reactive refs (`current`, `result`, `error`) update either way.

## Lazy queries during SSR

`useLazyQuery` does not run on the server because there is no user action to trigger it. If a value needs to be available during SSR, use `useQuery` instead. See [SSR Overview](/ssr/overview).

## Options and result reference

For every available option and method, see:

- [`useLazyQuery.Options`](/api/composable/@vue/namespaces/useLazyQuery/interfaces/Options)
- [`useLazyQuery.Result`](/api/composable/@vue/namespaces/useLazyQuery/interfaces/Result)

## Next steps

- [Queries](/data/queries) for the basic `useQuery` patterns.
- [Refetching](/data/refetching) compares lazy loading with refetch and poll.
- [Loading States](/advanced/loading-states) handles loading indicators across many queries.
