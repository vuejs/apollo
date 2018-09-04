import Vue from "vue";
import { DollarApollo } from './vue-apollo';
import { VueApolloComponentOption } from './options'

declare module "vue/types/options" {
  interface ComponentOptions<V extends Vue> {
    apolloProvider?: VueApolloComponentOption<V>;
  }
}

declare module "vue/types/vue" {
  interface Vue {
    $apollo: DollarApollo<any>;
  }
}
