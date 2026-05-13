# Error Handling

Apollo Client surfaces failures in a uniform `error` field. This page covers how to read those errors, classify them, and recover.

## Categories of errors

Errors fall into two broad categories: GraphQL errors and network errors.

### GraphQL errors

These come from the server-side execution of a GraphQL operation:

- **Syntax errors** (the query was malformed).
- **Validation errors** (the query referenced a field that does not exist).
- **Resolver errors** (a field's resolver threw during execution).

If a syntax or validation error occurs, the server does not execute the operation at all. If a resolver error occurs, the server may still return [partial data](#using-partial-data).

A GraphQL error response looks like:

```json
{
  "errors": [
    {
      "message": "Cannot query field \"nonexistentField\" on type \"Query\".",
      "locations": [{ "line": 2, "column": 3 }],
      "extensions": {
        "code": "GRAPHQL_VALIDATION_FAILED"
      }
    }
  ],
  "data": null
}
```

Apollo Client represents GraphQL errors with the `CombinedGraphQLErrors` class.

### Network errors

These come from communicating with the server:

- `4xx` or `5xx` HTTP status codes.
- Network unavailable.
- Response parsing failures (invalid JSON).
- Custom errors thrown in your Apollo Link chain.

Network errors are represented by several classes:

| Class | When it appears |
|------|------|
| `ServerError` | Server responded with a non-200 HTTP status. |
| `ServerParseError` | Server response could not be parsed as JSON. |
| `CombinedProtocolErrors` | Transport-level errors during multipart HTTP subscriptions. |
| `LocalStateError` | Errors in local-state configuration or execution. |

## Reading errors

### Queries

Read errors through `current.error`:

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ users: { id: string }[] }, {}>
// ---cut---
const { current } = useQuery(gql`
  query GetUsers {
    users { id }
  }
`)
</script>

<template>
  <div v-if="current.loading">
    Loading...
  </div>
  <div v-else-if="current.error" class="error">
    Error: {{ current.error.message }}
  </div>
  <div v-else-if="current.resultState === 'complete'">
    <!-- Render data -->
  </div>
</template>
```

### Mutations

Read errors through the `error` ref:

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'
import { useMutation } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ createUser: { id: string } }, { name: string }>
// ---cut---
const { mutate, error, loading } = useMutation(gql`
  mutation CreateUser($name: String!) {
    createUser(name: $name) { id }
  }
`)
</script>

<template>
  <p v-if="error" class="error">
    {{ error.message }}
  </p>
</template>
```

### Subscriptions

Read errors through the `error` ref, or register an `onError` callback:

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'
import { useSubscription } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ messageAdded: { id: string } }, {}>
// ---cut---
const { error, onError } = useSubscription(gql`
  subscription OnMessageAdded {
    messageAdded { id }
  }
`)

onError((err) => {
  console.error('Subscription error:', err)
})
</script>

<template>
  <div v-if="error">
    Connection error: {{ error.message }}
  </div>
</template>
```

## Error event hooks

Every composable exposes an `onError` event hook for imperative handling:

```ts twoslash
import { TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ users: { id: string }[] }, {}>
const GET_USERS = gql``
// ---cut---
const { onError } = useQuery(GET_USERS)

onError((error) => {
  console.error('Query failed:', error.message)

  // Show a toast notification
  // toast.error(error.message)

  // Report to an error-tracking service
  // errorTracker.capture(error)
})
```

## Mutation throwing behavior

By default, `mutate()` throws when no `onError` handler is registered. The `throws` option controls this:

```ts twoslash
import { TypedDocumentNode } from '@apollo/client'
import { useMutation } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ createUser: { id: string } }, { name: string }>
const CREATE_USER = gql``
// ---cut---
// Never throw, read the error ref instead
const { mutate, error } = useMutation(CREATE_USER, { throws: 'never' })

async function handleSubmit() {
  await mutate({ variables: { name: 'Alice' } })

  if (error.value) {
    console.error('Failed:', error.value.message)
  }
}
```

Or with `throws: 'always'` and a try/catch:

```ts twoslash
import { TypedDocumentNode } from '@apollo/client'
import { useMutation } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ createUser: { id: string } }, { name: string }>
const CREATE_USER = gql``
// ---cut---
const { mutate } = useMutation(CREATE_USER, { throws: 'always' })

async function handleSubmit() {
  try {
    const result = await mutate({ variables: { name: 'Alice' } })
    console.log('Created user:', result?.data?.createUser)
  }
  catch (e) {
    console.error('Mutation failed:', e)
  }
}
```

| Value | Behavior |
|-------|----------|
| `'auto'` | Throws when no `onError` handler is registered **(default)** |
| `'always'` | Always throws |
| `'never'` | Never throws |

## Error policies

By default, Apollo Client discards partial data when a GraphQL error occurs and populates `error`. Change this with `errorPolicy`:

```ts twoslash
import { TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ users: { id: string }[] }, {}>
const GET_USERS = gql``
// ---cut---
const { current } = useQuery(GET_USERS, {
  errorPolicy: 'all',
})
```

| Policy | Behavior |
|--------|----------|
| `'none'` | Returns errors in `error` and clears `result`. **(default)** |
| `'ignore'` | Ignores errors; `error` is not populated. `result` may still hold partial data. |
| `'all'` | Populates both `result` and `error` so you can render both. |

### Using partial data

With `errorPolicy: 'all'`, partial data is available alongside the error:

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ goodField: string, badField: string }, {}>
// ---cut---
const { current } = useQuery(
  gql`
    query MixedResults {
      goodField     # Resolves successfully
      badField      # Resolver throws
    }
  `,
  { errorPolicy: 'all' },
)
</script>

<template>
  <div v-if="current.error" class="warning">
    Some data couldn't be loaded: {{ current.error.message }}
  </div>
  <div v-if="current.result">
    <p>Good field: {{ current.result.goodField }}</p>
  </div>
</template>
```

## Identifying error types

Apollo Client's error classes expose a static `is` method that identifies the error reliably across realms (workers, iframes, etc.). Prefer it over `instanceof`:

```ts
import {
  CombinedGraphQLErrors,
  CombinedProtocolErrors,
  ServerError,
  ServerParseError,
} from '@apollo/client/errors'

function handleError(error: unknown) {
  if (CombinedGraphQLErrors.is(error)) {
    console.log('GraphQL errors:', error.errors)
  }
  else if (ServerError.is(error)) {
    console.log('Server error:', error.statusCode)
  }
  else if (ServerParseError.is(error)) {
    console.log('Parse error:', error.bodyText)
  }
  else if (CombinedProtocolErrors.is(error)) {
    console.log('Protocol errors:', error.errors)
  }
  else {
    console.log('Unknown error:', error)
  }
}
```

## Centralized error handling with Apollo Link

For app-wide error handling, [`ErrorLink`](https://www.apollographql.com/docs/react/api/link/apollo-link-error/) intercepts every operation:

```ts
import { ApolloClient, from, HttpLink, InMemoryCache } from '@apollo/client'
import { CombinedGraphQLErrors } from '@apollo/client/errors'
import { ErrorLink } from '@apollo/client/link/error'

const errorLink = new ErrorLink(({ error }) => {
  if (CombinedGraphQLErrors.is(error)) {
    error.errors.forEach(({ message, locations, path }) => {
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
      )
    })
  }
  else {
    console.error('[Network error]:', error)
  }
})

const httpLink = new HttpLink({ uri: '/graphql' })

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: from([errorLink, httpLink]),
})
```

### Retry on authentication errors

`ErrorLink` can refresh a token and retry the operation:

```ts
import { CombinedGraphQLErrors } from '@apollo/client/errors'
import { ErrorLink } from '@apollo/client/link/error'

const errorLink = new ErrorLink(({ error, operation, forward }) => {
  if (CombinedGraphQLErrors.is(error)) {
    for (const err of error.errors) {
      if (err.extensions?.code === 'UNAUTHENTICATED') {
        const newToken = refreshToken()

        const oldHeaders = operation.getContext().headers
        operation.setContext({
          headers: {
            ...oldHeaders,
            authorization: `Bearer ${newToken}`,
          },
        })

        return forward(operation)
      }
    }
  }
})
```

::: warning
If the retried operation also fails, those errors do not reach `ErrorLink` again. An `ErrorLink` can only retry a particular operation once.
:::

### Retry on network errors

For network errors, [`RetryLink`](https://www.apollographql.com/docs/react/api/link/apollo-link-retry/) handles exponential backoff:

```ts
import { from, HttpLink } from '@apollo/client'
import { RetryLink } from '@apollo/client/link/retry'

const retryLink = new RetryLink({
  delay: {
    initial: 300,
    max: Infinity,
    jitter: true,
  },
  attempts: {
    max: 5,
    retryIf: (error, _operation) => !!error,
  },
})

const link = from([retryLink, new HttpLink({ uri: '/graphql' })])
```

## Resetting mutation errors

`reset()` clears mutation errors so the form can be tried again:

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'
import { useMutation } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ createUser: { id: string } }, { name: string }>
const CREATE_USER = gql``
// ---cut---
const { mutate, error, reset } = useMutation(CREATE_USER)

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

## Next steps

- [Queries](/data/queries) and [Mutations](/data/mutations) cover the basics.
- [TypeScript](/data/typescript) for type-safe error handling.
