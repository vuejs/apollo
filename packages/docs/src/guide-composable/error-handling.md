# Error handling

Any application, from simple to complex, can have its fair share of errors. It is important to handle these errors and when possible, report these errors back to your users for information. Using GraphQL brings a new set of possible errors from the actual GraphQL response itself. With that in mind, here are a few different types of errors:

- GraphQL Errors: errors in the GraphQL results that can appear alongside successful data
- Server Errors: server internal errors that prevent a successful response from being formed
- Transaction Errors: errors inside transaction actions like `update` on mutations
- UI Errors: errors that occur in your component code
- Apollo Client Errors: internal errors within the core or corresponding libraries

## Error policies

Much like `fetchPolicy`, `errorPolicy` allows you to control how GraphQL Errors from the server are sent to your UI code. By default, the error policy treats any GraphQL Errors as network errors and ends the request chain. It doesn't save any data in the cache, and renders your UI with the `error` prop to be an ApolloError. By changing this policy per request, you can adjust how GraphQL Errors are managed in the cache and your UI. The possible options for `errorPolicy` are:

- `none`: This is the default policy to match how Apollo Client 1.0 worked. Any GraphQL Errors are treated the same as network errors and any data is ignored from the response.
- `ignore`: Ignore allows you to read any data that is returned alongside GraphQL Errors, but doesn't save the errors or report them to your UI.
- `all`: Using the `all` policy is the best way to notify your users of potential issues while still showing as much data as possible from your server. It saves both data and errors into the Apollo Cache so your UI can use them.

You can set `errorPolicy` on each request like so:

```vue{10}
<script>
export default {
  setup () {
    const { result, loading, error } = useQuery(gql`
      query WillFail {
        badField
        goodField
      }
    `, null, {
      errorPolicy: 'all',
    })

    return {
      result,
      loading,
      error,
    }
  },
}
</script>

<template>
  <div v-if="loading">Loading...</div>
  <div v-else>
    <h2>Good: {{ result.goodField }}</h2>
    <pre>Bad:
      <span v-for="(error, i) of error.graphQLErrors" :key="i">
        {{ error.message }}
      </span>
    </pre>
  </div>
</template>
```

## Network Errors

When using Apollo Link, the ability to handle network errors is way more powerful. The best way to do this is to use the `@apollo/client/link/error` to catch and handle server errors, network errors, and GraphQL errors. If you would like to combine with other links, see [composing links](https://www.apollographql.com/docs/link/composition).

```js
import { onError } from '@apollo/client/link/error'

const link = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.map(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
      ),
    )

  if (networkError) console.log(`[Network error]: ${networkError}`)
})
```

You can also use the `logErrorMessages` function from the `@vue/apollo-util` package to format the error in the browser console:

```js
import { onError } from '@apollo/client/link/error'
import { logErrorMessages } from '@vue/apollo-util'

const link = onError(error => {
  logErrorMessages(error)
})
```

Example error:

![Error log screenshot](/error-log.jpeg)

If you are using Webpack or Vue CLI, it's a good idea to only use it in development:

```js
import { onError } from '@apollo/client/link/error'
import { logErrorMessages } from '@vue/apollo-util'

const link = onError(error => {
  if (process.env.NODE_ENV !== 'production') {
    logErrorMessages(error)
  }
})
```

That way it will be dropped when compiling the project for production.

#### Options

Error Link takes a function that is called in the event of an error. This function is called with an object containing the following keys:

- `operation`: The Operation that errored
- `response`: The response from the server
- `graphQLErrors`: An array of errors from the GraphQL endpoint
- `networkError`: any error during the link execution or server response

#### Ignoring errors

If you want to conditionally ignore errors, you can set `response.errors = null;` within the error handler:

```js
onError(({ response, operation }) => {
  if (operation.operationName === 'IgnoreErrorsQuery') {
    response.errors = null
  }
})
```
