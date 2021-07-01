import { createApp, h } from 'vue'

import 'isomorphic-fetch'
import { ApolloClient, HttpLink } from '@apollo/client/core'

import { createApolloProvider } from '../index'
import App from './App'
import Decorator from './Decorator'

const httpLink = new HttpLink({ uri: 'https://dummy.test.com' })
const cache: any = 'dummy cache'
const apolloClient = new ApolloClient({
  link: httpLink,
  cache,
  connectToDevTools: true,
})
const apolloProvider = createApolloProvider({
  defaultClient: apolloClient,
  defaultOptions: {
    $query: {
      fetchPolicy: 'cache-and-network',
    },
  },
})

/* eslint no-new: 0 */
const app = createApp({
  el: '#app',
  render: () => h(App, [
    h(Decorator),
  ]),
})
app.use(apolloProvider)

// test to able to call below methods
console.log(apolloProvider.defaultClient.query)
console.log(apolloProvider.clients.key.query)
