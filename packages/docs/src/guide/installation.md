# Installation

## Vue CLI Plugin

I made a plugin for [vue-cli](http://cli.vuejs.org) so you can add Apollo (with an optional GraphQL server!) in literally two minutes! ✨🚀

In your vue-cli 3 project:

```shell
vue add apollo
```

Then you can skip to next section: [Basic Usage](./apollo/).

[More info](https://github.com/Akryum/vue-cli-plugin-apollo)

## Manual installation

```shell
npm install --save graphql graphql-tag @apollo/client
```

Or:

```shell
yarn add graphql graphql-tag @apollo/client
```

In your app, create an `ApolloClient` instance:

```js
import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client/core'

// HTTP connection to the API
const httpLink = createHttpLink({
  // You should use an absolute URL here
  uri: 'http://localhost:3020/graphql',
})

// Cache implementation
const cache = new InMemoryCache()

// Create the apollo client
const apolloClient = new ApolloClient({
  link: httpLink,
  cache,
})
```

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
    ],
  },
}
```

### Webstorm

If you are using Webstorm, it's recommended to install the [JS GraphQL extension](https://plugins.jetbrains.com/plugin/8097-js-graphql/).

Then configure it by creating a `.graphqlconfig` file in the root folder of the Vue project:

```graphqlconfig
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
- [Advanced topics](../guide-advanced)
