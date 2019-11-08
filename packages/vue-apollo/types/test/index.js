import Vue from 'vue';
import 'isomorphic-fetch';
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import VueApollo from '../index';
import App from './App';
import Decorator from './Decorator';
var httpLink = new HttpLink({ uri: 'https://dummy.test.com' });
var cache = 'dummy cache';
var apolloClient = new ApolloClient({
    link: httpLink,
    cache: cache,
    connectToDevTools: true
});
var apolloProvider = new VueApollo({
    defaultClient: apolloClient,
    defaultOptions: {
        $query: {
            fetchPolicy: 'cache-and-network'
        }
    }
});
Vue.use(VueApollo);
/* eslint no-new: 0 */
new Vue({
    el: '#app',
    provide: apolloProvider.provide(),
    render: function (h) { return h(App, [
        h(Decorator)
    ]); }
});
// test to able to call below methods
console.log(apolloProvider.defaultClient.query);
console.log(apolloProvider.clients['key'].query);
