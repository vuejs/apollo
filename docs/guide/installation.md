# Installation

## Vue CLI Plugin

I made a plugin for [vue-cli](http://cli.vuejs.org) so you can add Apollo (with an optional GraphQL server!) in literally two minutes! ✨🚀

In your vue-cli 3 project:

```bash
vue add apollo
```

Then you can skip to next section: [Basic Usage](./apollo/).

[More info](https://github.com/Akryum/vue-cli-plugin-apollo)

## Manual installation

### 1. Apollo Client

```
npm install --save vue-apollo graphql @apollo/client
```

Or:

```
yarn add vue-apollo graphql @apollo/client
```

In your app, create an `ApolloClient` instance:

```js
import { ApolloClient } from '@apollo/client';

const apolloClient = new ApolloClient({
  // You should use an absolute URL here
  uri: 'https://api.graphcms.com/simple/v1/awesomeTalksClone'
})
```

### 2. Install the plugin into Vue

```js
import Vue from 'vue'
import VueApollo from 'vue-apollo'

Vue.use(VueApollo)
```

### 3. Apollo provider

The provider holds the Apollo client instances that can then be used by all the child components.

```js
const apolloProvider = new VueApollo({
  defaultClient: apolloClient,
})
```

Add it to your app with the `apolloProvider` option:

```js
new Vue({
  el: '#app',
  // inject apolloProvider here like vue-router or vuex
  apolloProvider,
  render: h => h(App),
})
```

You are now ready to use Apollo in your components!

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
