import Vue from 'vue'
import { DollarApollo } from './vue-apollo'
import { VueApolloComponentOption } from './options'
import { ApolloProvider } from './apollo-provider';
import { CombinedVueInstance } from 'vue/types/vue';

declare module 'vue/types/options' {
  interface ComponentOptions<V extends Vue, Data, Methods, Computed, PropsDef, Props> {
    apolloProvider?: ApolloProvider
    apollo?: Data extends DataDef<infer D, any, any>
      ? VueApolloComponentOption<
          CombinedVueInstance<V, D, Methods, Computed, Props>
        >
      : CombinedVueInstance<V, Data, Methods, Computed, Props>
  }
}

declare module 'vue/types/vue' {
  interface Vue {
    $apolloProvider: ApolloProvider
    $apollo: DollarApollo<any>;
  }
}
