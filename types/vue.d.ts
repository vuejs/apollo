import Vue from "vue";
import { VueApollo, VueApolloComponentOption, ApolloProperty } from './vue-apollo';

declare module "vue/types/options" {
  interface ComponentOptions<V extends Vue> {
    apolloProvider?: VueApollo;
    apollo?: VueApolloComponentOption<V>;
  }
}

declare module "vue/types/vue" {
  interface Vue {
    $apollo: ApolloProperty<any>;
  }
}