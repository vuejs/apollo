import Vue from 'vue'
import { CombinedVueInstance } from 'vue/types/vue'
import { DollarApollo } from './vue-apollo'
import { VueApolloComponentOptions } from './options'
import { ApolloProvider } from './apollo-provider'

type DataDef<Data, Props, V> = Data | ((this: Readonly<Props> & V) => Data)

declare module 'vue/types/options' {
  interface ComponentOptions<V extends Vue, Data, Methods, Computed, PropsDef, Props> {
    apolloProvider?: ApolloProvider
    apollo?: VueApolloComponentOptions<
      Data extends DataDef<infer D, any, any>
        ? CombinedVueInstance<V, D, Methods, Computed, Props>
        : CombinedVueInstance<V, Data, Methods, Computed, Props>
      >
  }
}

declare module 'vue/types/vue' {
  interface Vue {
    $apolloProvider: ApolloProvider
    $apollo: DollarApollo<this>
  }
}
