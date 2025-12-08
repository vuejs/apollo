# Installation

## Compatibility

- Vue 3
- Apollo Client 4.1+

::: warning Apollo Client 4.1 Required
Vue Apollo requires `@apollo/client` version 4.1.0 or higher, which is currently in alpha. Make sure to install the alpha version explicitly:

```
@apollo/client@^4.1.0-alpha.8
```

This version includes important features like improved TypeScript support and array support in `watchFragment` that Vue Apollo depends on.
:::

## Manual installation

::: code-group

```shell [npm]
npm install --save graphql graphql-tag @apollo/client@^4.1.0-alpha.8
```

```shell [yarn]
yarn add graphql graphql-tag @apollo/client@^4.1.0-alpha.8
```

```shell [pnpm]
pnpm add graphql graphql-tag @apollo/client@^4.1.0-alpha.8
```

:::

## Creating an Apollo Client

In your app, create an `ApolloClient` instance. Apollo Client uses a modular link system to handle network requests. For an in-depth guide on links, see the [Apollo Link documentation](https://www.apollographql.com/docs/react/api/link/introduction).

### Basic HTTP Link

The simplest setup uses `HttpLink` for standard GraphQL over HTTP:

```ts twoslash
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'

// HTTP connection to the API
const httpLink = new HttpLink({
  uri: 'http://localhost:4000/graphql',
})

// Cache implementation
const cache = new InMemoryCache()

// Create the apollo client
const apolloClient = new ApolloClient({
  link: httpLink,
  cache,
})
```

### SSE Link (Server-Sent Events)

For real-time features like subscriptions or streaming responses (`@defer`, `@stream`), you can use Server-Sent Events with the `graphql-sse` package:

::: code-group

```shell [npm]
npm install --save graphql-sse
```

```shell [yarn]
yarn add graphql-sse
```

```shell [pnpm]
pnpm add graphql-sse
```

:::

Then create a custom SSE link:

```ts twoslash
import type { Client, ClientOptions } from 'graphql-sse'
import { ApolloClient, ApolloLink, InMemoryCache, Observable } from '@apollo/client'
import { print } from 'graphql'
import { createClient } from 'graphql-sse'

class SSELink extends ApolloLink {
  private client: Client

  constructor(options: ClientOptions) {
    super()
    this.client = createClient(options)
  }

  public request(operation: ApolloLink.Operation): Observable<ApolloLink.Result> {
    return new Observable((sink) => {
      return this.client.subscribe<ApolloLink.Result>(
        {
          query: print(operation.query),
          variables: operation.variables,
          extensions: operation.extensions,
          ...(operation.operationName && { operationName: operation.operationName }),
        },
        {
          next: data => sink.next(data as ApolloLink.Result),
          complete: sink.complete.bind(sink),
          error: sink.error.bind(sink),
        },
      )
    })
  }

  public dispose() {
    this.client.dispose()
  }
}

// Create the SSE link
const sseLink = new SSELink({
  url: 'http://localhost:4000/graphql',
})

// Create the apollo client
const apolloClient = new ApolloClient({
  link: sseLink,
  cache: new InMemoryCache(),
})
```

### Enabling `@defer` and `@stream` Support

To use the `@defer` and `@stream` GraphQL directives for incremental data delivery, you need to configure the `incrementalHandler` option:

```ts
import { ApolloClient, InMemoryCache } from '@apollo/client'
import { Defer20220824Handler } from '@apollo/client/incremental'

const apolloClient = new ApolloClient({
  link: sseLink, // or httpLink with multipart support
  cache: new InMemoryCache(),
  incrementalHandler: new Defer20220824Handler(),
})
```

::: tip Learn more about @defer
The `@defer` directive allows you to mark parts of your query as deferrable, meaning they can be streamed to the client as they become available. This is useful for optimizing perceived loading times.

See the [Apollo @defer documentation](https://www.apollographql.com/docs/react/data/defer) for more details on usage and server requirements.
:::

Continue installation in [Next Steps](#next-steps).

## IDE integration

### Visual Studio Code

If you are using VS Code, it's recommended to install the [Apollo GraphQL extension](https://marketplace.visualstudio.com/items?itemName=apollographql.vscode-apollo).

Then configure it by creating a `apollo.config.js` file in the root folder of the Vue project:

```js
// apollo.config.js
module.exports = {
  client: {
    service: {
      name: 'my-app',
      // URL to the GraphQL API
      url: 'http://localhost:3000/graphql',
    },
    // Files processed by the extension
    includes: [
      'src/**/*.vue',
      'src/**/*.js',
      'src/**/*.ts',
    ],
  },
}
```

### Webstorm

If you are using Webstorm, it's recommended to install the [JS GraphQL extension](https://plugins.jetbrains.com/plugin/8097-js-graphql/).

Then configure it by creating a `.graphqlconfig` file in the root folder of the Vue project:

```json
{
  "name": "Untitled GraphQL Schema",
  "schemaPath": "./path/to/schema.graphql",
  "extensions": {
    "endpoints": {
      "Default GraphQL Endpoint": {
        "url": "http://url/to/the/graphql/api",
        "headers": {
          "user-agent": "JS GraphQL"
        },
        "introspect": false
      }
    }
  }
}
```

## Next steps

Continue with one of those guides:

- [Option (Classic) API](../guide-option/setup.md)
- [Composition (Advanced) API](../guide-composable/setup.md)
- [Components API](../guide-components/setup.md)
- [Advanced topics](../guide-advanced/)
