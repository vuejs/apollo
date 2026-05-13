# Authentication

For any app where users have identity, the server needs to know who is making each request. Apollo Client supports the common patterns: cookies for browser sessions, bearer tokens through headers, and silent token refresh on auth errors.

## Cookies

If your backend handles sessions through cookies (Set-Cookie + same-site or CORS-credentialed cookies), tell `HttpLink` to send credentials:

```ts
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'

const apolloClient = new ApolloClient({
  link: new HttpLink({
    uri: '/graphql',
    credentials: 'same-origin', // or 'include' for cross-origin
  }),
  cache: new InMemoryCache(),
})
```

If your backend is on a different origin, use `credentials: 'include'` and configure CORS on the server to allow credentials.

That is the entire client-side setup for cookie auth. The browser handles the rest.

## Bearer tokens

For token-based auth (typically JWT), add an `authorization` header on each request through `SetContextLink`:

```ts
import { ApolloClient, from, HttpLink, InMemoryCache } from '@apollo/client'
import { SetContextLink } from '@apollo/client/link/context'

const httpLink = new HttpLink({ uri: '/graphql' })

const authLink = new SetContextLink((operation, prevContext) => {
  const token = localStorage.getItem('token')
  return {
    ...prevContext,
    headers: {
      ...prevContext.headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  }
})

export const apolloClient = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache(),
})
```

`SetContextLink` runs on each operation, so the token is re-read every time. Updates to the stored token take effect on the next request without recreating the client.

## Reading tokens from Vue state

For tokens stored in a Pinia store or a Vue ref, you can read the current value from `SetContextLink`:

```ts
import { ApolloClient, from, HttpLink, InMemoryCache } from '@apollo/client'
import { SetContextLink } from '@apollo/client/link/context'
import { useAuthStore } from './stores/auth'

const httpLink = new HttpLink({ uri: '/graphql' })

const authLink = new SetContextLink((operation, prevContext) => {
  const auth = useAuthStore()
  return {
    ...prevContext,
    headers: {
      ...prevContext.headers,
      authorization: auth.token ? `Bearer ${auth.token}` : '',
    },
  }
})

export const apolloClient = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache(),
})
```

`useAuthStore()` (Pinia) works because `SetContextLink` runs at request time, after Vue is initialized. For other state sources (a `ref`, an `inject`, an environment-aware token resolver), the pattern is the same: read the value inside the function.

## Refreshing tokens on auth errors

If your tokens expire and the server returns `UNAUTHENTICATED` errors, you can refresh and retry transparently through `ErrorLink`:

```ts
import { ApolloClient, from, HttpLink, InMemoryCache } from '@apollo/client'
import { CombinedGraphQLErrors } from '@apollo/client/errors'
import { SetContextLink } from '@apollo/client/link/context'
import { ErrorLink } from '@apollo/client/link/error'

const httpLink = new HttpLink({ uri: '/graphql' })

const authLink = new SetContextLink((operation, prevContext) => ({
  ...prevContext,
  headers: {
    ...prevContext.headers,
    authorization: localStorage.getItem('token')
      ? `Bearer ${localStorage.getItem('token')}`
      : '',
  },
}))

const errorLink = new ErrorLink(({ error, operation, forward }) => {
  if (!CombinedGraphQLErrors.is(error))
    return

  for (const err of error.errors) {
    if (err.extensions?.code === 'UNAUTHENTICATED') {
      // Refresh the token (synchronously or async)
      const newToken = refreshToken()
      localStorage.setItem('token', newToken)

      // Update the operation's headers
      operation.setContext(({ headers }) => ({
        headers: {
          ...headers,
          authorization: `Bearer ${newToken}`,
        },
      }))

      // Retry
      return forward(operation)
    }
  }
})

const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
})
```

::: warning One retry per operation
`ErrorLink` only retries a particular operation once. If the retry itself fails, those errors do not loop back through `ErrorLink`. This prevents infinite retry loops when the refresh token is also dead.
:::

For more on error handling, see [Error Handling](/data/error-handling).

## Resetting the cache on login or logout

Apollo's cache reflects "what the current user is allowed to see." On login or logout, the cache becomes stale because the user identity changed.

Call `client.resetStore()` to clear the cache and refetch every active query:

```vue twoslash
<script setup lang="ts">
import { useApolloClient } from '@vue/apollo-composable'

const { client } = useApolloClient()

async function logout() {
  await fetch('/logout', { method: 'POST' })
  localStorage.removeItem('token')
  await client.resetStore() // Clears cache + refetches active queries
}
</script>
```

For a logout where you do not want to refetch (because the user is being redirected away), use `client.clearStore()` instead. It clears the cache without notifying queries.

## Multiple clients with different auth

When you have multiple GraphQL backends with different auth schemes (a public API and a private one, for example), use [Multiple Clients](/advanced/multiple-clients) and give each client its own link chain.

## Next steps

- [Basic HTTP](/networking/basic-http) for the underlying HTTP setup.
- [Error Handling](/data/error-handling) covers `ErrorLink` and error policies in depth.
- [Multiple Clients](/advanced/multiple-clients) for splitting traffic across backends.
