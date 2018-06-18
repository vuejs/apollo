# Installation

:::tip
If you are using vue-cli 3.x, you can [use this vue-cli plugin](https://github.com/Akryum/vue-cli-plugin-apollo): it will install everything you need for you in a few minutes so you can start coding right away!
:::

Try and install these packages before server side set (of packages), add apollo to meteor.js before then, too.

```
npm install --save vue-apollo graphql apollo-client apollo-link apollo-link-http apollo-cache-inmemory graphql-tag
```

Or:

```
yarn add vue-apollo graphql apollo-client apollo-link apollo-link-http apollo-cache-inmemory graphql-tag
```

## Apollo client

In your app, create an `ApolloClient` instance and install the `VueApollo` plugin:

```js
import Vue from 'vue'
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import VueApollo from 'vue-apollo'

const httpLink = new HttpLink({
  // You should use an absolute URL here
  uri: 'http://localhost:3020/graphql',
})

// Create the apollo client
const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  connectToDevTools: true,
})

// Install the vue plugin
Vue.use(VueApollo)
```

## Apollo provider

The provider holds the apollo client instances that can then be used by all the child components. Inject it into your components with `provide`:

```js
const apolloProvider = new VueApollo({
  defaultClient: apolloClient,
})

new Vue({
  el: '#app',
  provide: apolloProvider.provide(),
  render: h => h(App),
})
```