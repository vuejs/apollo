import Vue from 'vue'

import 'isomorphic-fetch'
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'

import VueApollo from '../index'
import App from './App'
import Decorator from './Decorator'

const httpLink = new HttpLink({ uri: 'https://dummy.test.com' })
const cache: any = 'dummy cache';
const apolloClient = new ApolloClient({
  link: httpLink,
  cache,
  connectToDevTools: true
})
const apolloProvider = new VueApollo({
  defaultClient: apolloClient,
  defaultOptions: {
    $query: {
      fetchPolicy: 'cache-and-network'
    }
  }
})

Vue.use(VueApollo)

/* eslint no-new: 0 */
new Vue({
  el: '#app',
  provide: apolloProvider.provide(),
  render: h => h(App, [
    h(Decorator)
  ])
})
