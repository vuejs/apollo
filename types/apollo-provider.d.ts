/* eslint no-unused-vars: 0 */

import { ApolloClient, ApolloQueryResult } from 'apollo-client'
import Vue, { PluginFunction, AsyncComponent } from 'vue'
import { VueApolloComponentOption } from './options'

export type VueApolloComponent<V extends Vue = Vue> = VueApolloComponentOption<V> | typeof Vue | AsyncComponent;

export class ApolloProvider {
  provide: (key?: string) => this
}
