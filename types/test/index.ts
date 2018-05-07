import Vue from 'vue'

import 'isomorphic-fetch'
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'

import VueApollo, { ApolloProvider } from '../index'
import App from './App'

const httpLink = new HttpLink({ uri: 'https://dummy.test.com' })
const cache: any = 'dummy cache';
const apolloClient = new ApolloClient({ link: httpLink, cache, connectToDevTools: true })
const apolloProvider = new VueApollo({ defaultClient: apolloClient })

Vue.use(VueApollo)

/* eslint no-new: 0 */
new Vue({ el: '#app', provide: apolloProvider.provide(), render: h => h(App) })

const provider: ApolloProvider = apolloProvider
const component = new Vue()

/* eslint no-unused-expressions: 0, no-return-await: 0 */
async () => await provider.prefetchAll({ context: 'context' }, [component])
async () => await provider.prefetchAll({ context: 'context' }, [component], { includeGlobal: false })

for (const key in provider.getStates()) { console.log(key) }
for (const key in provider.getStates({ exportNamespace: 'nameSpace' })) { console.log(key) }

provider.exportStates().match(/js/)
provider.exportStates({ globalName: '__APOLLO_STATE__', attachTo: 'window', exportNamespace: '' }).match(/js/)
