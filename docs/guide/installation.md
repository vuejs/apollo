# Installation

## Vue CLI Plugin

I made a plugin for [vue-cli](http://cli.vuejs.org) so you can add Apollo (with an optional GraphQL server!) in literary two minutes! ✨🚀

In your vue-cli 3 project:

```bash
vue add apollo
```

Then you can skip to next section: [Basic Usage](./apollo/).

[More info](https://github.com/Akryum/vue-cli-plugin-apollo)

## Apollo Boost

Apollo Boost is a zero-config way to start using Apollo Client. It includes some sensible defaults, such as our recommended `InMemoryCache` and `HttpLink`, which come configured for you with our recommended settings and it's perfect for starting to develop fast:

Install: 

```
npm install --save vue-apollo graphql apollo-boost
```

Or:

```
yarn add vue-apollo graphql apollo-boost
```

### Apollo client

In your app, create an `ApolloClient` instance and install the `VueApollo` plugin:

```js
import Vue from 'vue'
import ApolloClient from "apollo-boost"
import VueApollo from "vue-apollo"

const apolloProvider = new VueApollo({
  defaultClient: new ApolloClient({
    uri: "https://api.graphcms.com/simple/v1/awesomeTalksClone"
  })
})

Vue.use(VueApollo)
```



## Manual

If you want some more fine grain control try and install these packages before server side set (of packages), add apollo to meteor.js before then, too.

```
npm install --save vue-apollo graphql apollo-client apollo-link apollo-link-http apollo-cache-inmemory graphql-tag
```

Or:

```
yarn add vue-apollo graphql apollo-client apollo-link apollo-link-http apollo-cache-inmemory graphql-tag
```

### Apollo client

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

const apolloProvider = new VueApollo({
  defaultClient: apolloClient,
})

// Install the vue plugin
Vue.use(VueApollo)
```

## Apollo provider

The provider holds the Apollo client instances that can then be used by all the child components. Inject it into your components with `provide`:

```js
new Vue({
  el: '#app',
  apolloProvider,
  render: h => h(App),
})
```
