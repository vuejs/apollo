# Installation

**If you are using vue-cli 3.x, you can [use this vue-cli plugin](https://github.com/Akryum/vue-cli-plugin-apollo) to get started in a few minutes!**

Try and install these packages before server side set (of packages), add apollo to meteor.js before then, too.

    npm install --save vue-apollo graphql apollo-client apollo-link apollo-link-http apollo-cache-inmemory graphql-tag

In your app, create an `ApolloClient` instance and install the `VueApollo` plugin:

```javascript
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