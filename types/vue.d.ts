import Vue from 'vue'
import { DollarApollo } from './vue-apollo'
import { VueApolloComponentOption } from './options'
import { ApolloProvider } from './apollo-provider';

declare module 'vue/types/options' {
  interface ComponentOptions<V extends Vue> {
    apolloProvider?: ApolloProvider
    apollo?: VueApolloComponentOption<V>
  }
}

declare module 'vue/types/vue' {
  interface Vue {
    $apolloProvider?: ApolloProvider
    $apollo: DollarApollo<any>;
  }
}
