import Vue, { PluginObject, PluginFunction } from 'vue';
import { DocumentNode } from 'graphql';
import { ApolloClient } from 'apollo-client';
import { SubscriptionOptions, ObservableQuery } from 'apollo-client'
import { DataProxy } from 'apollo-cache';
import { subscribe } from 'graphql/subscription/subscribe';
import { ApolloProvider, VueApolloComponent } from './apollo-provider'
import { VueApolloQueryOptions, VueApolloMutationOptions, VueApolloSubscriptionOptions, ApolloVueThisType, VueApolloOptions } from './options'

export class VueApollo extends ApolloProvider implements PluginObject<{}>{
  [key: string]: any;
  install: PluginFunction<{}>;
  constructor (options: { defaultClient: ApolloClient<{}>, defaultOptions?: VueApolloOptions, clients?: { [key: string]: ApolloClient<{}> } });
  static install(pVue: typeof Vue, options?:{} | undefined): void;
}

type Query<V> = (key: string, options: VueApolloQueryOptions<V, any>) => void;
type Mutate<V, R=any> = <R=any>(params: VueApolloMutationOptions<V, R>) => Promise<R>;
type Subscribe<R=any> = <R=any>(params: SubscriptionOptions) => ObservableQuery<R>;
export interface ApolloProperty<V> {
  [key: string]: Query<V> | Mutate<V> | Subscribe; // smart query
  queries: any;
  mutate: Mutate<V>;
  subscribe: Subscribe;
}

export function willPrefetch (component: VueApolloComponent, contextCallback?: boolean): VueApolloComponent