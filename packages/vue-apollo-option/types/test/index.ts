import Vue from 'vue'

import 'isomorphic-fetch'
import { ApolloClient, HttpLink } from '@apollo/client/core'

import VueApollo from '../index'
import App from './App'
import Decorator from './Decorator'

const httpLink = new HttpLink({ uri: 'https://dummy.test.com' })
const cache: any = 'dummy cache'
const apolloClient = new ApolloClient({
  link: httpLink,
  cache,
  connectToDevTools: true,
})
const apolloProvider = new VueApollo({
  defaultClient: apolloClient,
  defaultOptions: {
    $query: {
      fetchPolicy: 'cache-and-network',
    },
  },
})

Vue.use(VueApollo)
/* eslint no-new: 0 */
new Vue({
  el: '#app',
  provide: apolloProvider.provide(),
  render: h => h(App, [
    h(Decorator),
  ]),
})

// test to able to call below methods
console.log(apolloProvider.defaultClient.query)
console.log(apolloProvider.clients.key.query)
