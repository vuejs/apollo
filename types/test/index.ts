import Vue from 'vue'

import 'isomorphic-fetch'
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { ApolloLink, split } from 'apollo-link'
import { getMainDefinition } from 'apollo-utilities'

import VueApollo from '../index'
import App from './App'

const httpLink = new HttpLink({ uri: 'https://dummy.test.com' })
const cache: any = 'dummy cache';
const apolloClient = new ApolloClient({ link: httpLink, cache, connectToDevTools: true })
const apolloProvider = new VueApollo({ defaultClient: apolloClient })

Vue.use(VueApollo)

new Vue({ el: '#app', apolloProvider, render: h => h(App), })