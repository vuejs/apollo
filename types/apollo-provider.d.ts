/* eslint no-unused-vars: 0 */

import Vue, { AsyncComponent } from 'vue'
import { VueApolloComponentOption } from './options'
import { ApolloClient } from 'apollo-client';
import { WatchLoading, ErrorHandler, VueApolloOptions } from './options'

export type VueApolloComponent<V extends Vue = Vue> = VueApolloComponentOption<V> | typeof Vue | AsyncComponent;

export class ApolloProvider<TCacheShape=any> {
  provide: (key?: string) => this
  constructor (options: {
    defaultClient: ApolloClient<TCacheShape>,
    defaultOptions?: VueApolloOptions<any>,
    clients?: { [key: string]: ApolloClient<TCacheShape> },
    watchLoading?: WatchLoading<any>,
    errorHandler?: ErrorHandler<any>
  })
  clients: { [key: string]: ApolloClient<TCacheShape> }
  defaultClient: ApolloClient<TCacheShape>
  prefetchQueries: any
}
