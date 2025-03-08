import type { ApolloProvider } from './apollo-provider'
import type { VueApolloComponentOptions } from './options'
import type { DollarApollo } from './vue-apollo'

declare module 'vue' {
  interface ComponentOptionsBase<
    Props,
    RawBindings,
    D,
    C extends ComputedOptions,
    M extends MethodOptions,
    Mixin extends ComponentOptionsMixin,
    Extends extends ComponentOptionsMixin,
    E extends EmitsOptions,
    EE extends string = string,
    Defaults = object,
  > {
    apolloProvider?: ApolloProvider
    apollo?: VueApolloComponentOptions<CreateComponentPublicInstance<Props, RawBindings, D, C, M, Mixin, Extends, E, Props, Defaults, false>>
  }

  interface ComponentCustomProperties {
    $apolloProvider: ApolloProvider
    $apollo: DollarApollo<this>
  }
}
