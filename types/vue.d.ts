import Vue from "vue";
import { VueApollo, ApolloProperty } from './vue-apollo';
import { VueApolloComponentOption } from './options'

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