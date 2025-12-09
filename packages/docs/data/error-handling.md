# Error Handling

Apollo Client can encounter a variety of errors when executing operations on your GraphQL server. Vue Apollo helps you handle these errors according to their type, enabling you to show appropriate information to the user when an error occurs.

## Understanding Errors

Errors in Apollo Client fall into two main categories: **GraphQL errors** and **network errors**. Apollo Client adds any encountered errors to the `error` field returned by composables like `useQuery`, wrapped in the appropriate error instance.

### GraphQL Errors

These are errors related to the server-side execution of a GraphQL operation:

- **Syntax errors** (e.g., a query was malformed)
- **Validation errors** (e.g., a query included a field that doesn't exist)
- **Resolver errors** (e.g., an error occurred while attempting to populate a query field)

If a syntax or validation error occurs, your server doesn't execute the operation at all. If resolver errors occur, your server can still return [partial data](#partial-data-with-resolver-errors).

When a GraphQL error occurs, your server includes it in the `errors` array of its response:

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

In Apollo Client, GraphQL errors are represented by the `CombinedGraphQLErrors` error type.

### Network Errors

These are errors encountered while attempting to communicate with your GraphQL server:

- `4xx` or `5xx` response status codes
- Network unavailable
- Response parsing failures (invalid JSON)
- Custom errors thrown in Apollo Link handlers

Network errors are represented by several error types:

| Error Type | Description |
|------------|-------------|
| `ServerError` | Server responded with a non-200 HTTP status code |
| `ServerParseError` | Server response cannot be parsed as valid JSON |
| `CombinedProtocolErrors` | Fatal transport-level errors during multipart HTTP subscriptions |
| `LocalStateError` | Errors in local state configuration or execution |

## Basic Error Handling

### Queries

Access errors through the `current.error` property or the `error` ref:

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ users: { id: string }[] }, {}>
// ---cut---
const { current, error } = useQuery(gql`
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

Access errors through the `error` ref:

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

Handle errors in subscriptions using the `error` ref or `onError` callback:

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

## Error Event Hooks

All composables provide an `onError` event hook for handling errors imperatively:

### useQuery

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

  // Report to error tracking service
  // errorTracker.capture(error)
})
```

### useMutation

```ts twoslash
import { TypedDocumentNode } from '@apollo/client'
import { useMutation } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ createUser: { id: string } }, { name: string }>
const CREATE_USER = gql``
// ---cut---
const { mutate, onError } = useMutation(CREATE_USER)

onError((error) => {
  console.error('Mutation failed:', error.message)
})
```

## Mutation Error Throwing

By default, `useMutation` throws errors when no `onError` handler is registered. Control this with the `throws` option:

```ts twoslash
import { TypedDocumentNode } from '@apollo/client'
import { useMutation } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ createUser: { id: string } }, { name: string }>
const CREATE_USER = gql``
// ---cut---
// Never throw - check error ref instead
const { mutate, error } = useMutation(CREATE_USER, {
  throws: 'never',
})

async function handleSubmit() {
  await mutate({ variables: { name: 'Alice' } })

  if (error.value) {
    console.error('Failed:', error.value.message)
  }
}
```

Use `throws: 'always'` with try/catch for explicit error handling:

```ts twoslash
import { TypedDocumentNode } from '@apollo/client'
import { useMutation } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ createUser: { id: string } }, { name: string }>
const CREATE_USER = gql``
// ---cut---
const { mutate } = useMutation(CREATE_USER, {
  throws: 'always',
})

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
| `'auto'` | Throws if no `onError` handler is registered **(default)** |
| `'always'` | Always throws errors |
| `'never'` | Never throws, use `error` ref instead |

## Error Policies

By default, Apollo Client throws away partial data and populates the `error` field. You can change this behavior with **error policies**.

### Setting an Error Policy

```ts twoslash
import { TypedDocumentNode } from '@apollo/client'
import { useMutation, useQuery } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ users: { id: string }[] }, {}>
const GET_USERS = gql``
// ---cut---
const { current } = useQuery(GET_USERS, {
  errorPolicy: 'all',
})
```

### Available Policies

| Policy | Description |
|--------|-------------|
| `'none'` | Returns errors in the `error` field and sets `result` to `undefined`. **(default)** |
| `'ignore'` | Errors are ignored (`error` is not populated), and any returned `data` is cached and rendered. |
| `'all'` | Both `result` and `error` are populated, enabling you to render both partial results and error information. |

### Using Partial Data

With `errorPolicy: 'all'`, you can display partial data alongside error messages:

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ goodField: string, badField: string }, {}>
// ---cut---
const { current } = useQuery(
  gql`
    query MixedResults {
      goodField # This succeeds
      badField # This field's resolver throws an error
    }
  `,
  {
    errorPolicy: 'all',
  },
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

## Identifying Error Types

Apollo Client error classes provide a static `is` method to reliably identify error types:

```ts
import {
  CombinedGraphQLErrors,
  CombinedProtocolErrors,
  ServerError,
  ServerParseError,
} from '@apollo/client/errors'

function handleError(error: unknown) {
  if (CombinedGraphQLErrors.is(error)) {
    // Handle GraphQL errors
    console.log('GraphQL errors:', error.errors)
  }
  else if (ServerError.is(error)) {
    // Handle server HTTP errors
    console.log('Server error:', error.statusCode)
  }
  else if (ServerParseError.is(error)) {
    // Handle JSON parse errors
    console.log('Parse error:', error.bodyText)
  }
  else if (CombinedProtocolErrors.is(error)) {
    // Handle multipart subscription protocol errors
    console.log('Protocol errors:', error.errors)
  }
  else {
    // Handle other errors
    console.log('Unknown error:', error)
  }
}
```

Using the static `is` method is more reliable than `instanceof` because it handles errors from different JavaScript realms correctly.

## Advanced Error Handling with Apollo Link

For centralized error handling, use [ErrorLink](https://www.apollographql.com/docs/react/api/link/apollo-link-error/) in your link chain:

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

### Retrying on Authentication Errors

Use `ErrorLink` to automatically refresh tokens and retry requests:

```ts
import { CombinedGraphQLErrors } from '@apollo/client/errors'
import { ErrorLink } from '@apollo/client/link/error'

const errorLink = new ErrorLink(({ error, operation, forward }) => {
  if (CombinedGraphQLErrors.is(error)) {
    for (const err of error.errors) {
      if (err.extensions?.code === 'UNAUTHENTICATED') {
        // Refresh the token
        const newToken = refreshToken()

        // Update the request headers
        const oldHeaders = operation.getContext().headers
        operation.setContext({
          headers: {
            ...oldHeaders,
            authorization: `Bearer ${newToken}`,
          },
        })

        // Retry the request
        return forward(operation)
      }
    }
  }
})
```

::: warning
If the retried operation also results in errors, those errors are not passed to `ErrorLink` again to prevent infinite loops. An `ErrorLink` can only retry a particular operation once.
:::

### Retrying on Network Errors

For network errors, use [RetryLink](https://www.apollographql.com/docs/react/api/link/apollo-link-retry/) with configurable retry logic:

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

## Error Handling Patterns

### Resetting Mutation Errors

Use the `reset` function to clear mutation errors:

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'
import { useMutation } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ createUser: { id: string } }, { name: string }>
const CREATE_USER = gql``
// ---cut---
const { mutate, error, reset } = useMutation(CREATE_USER)

function dismissError() {
  reset() // Clears error and called state
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

## Next Steps

- [Queries](/data/queries) - Learn query basics
- [Mutations](/data/mutations) - Learn mutation basics
- [TypeScript](/data/typescript) - Type-safe error handling
