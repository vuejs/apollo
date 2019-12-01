import CApolloQuery from './ApolloQuery'
import CApolloSubscribeToMore from './ApolloSubscribeToMore'
import CApolloMutation from './ApolloMutation'

const plugin = {}

export function install (Vue, options) {
  if (install.installed) return
  install.installed = true

  Vue.component('apollo-query', CApolloQuery)
  Vue.component('ApolloQuery', CApolloQuery)
  Vue.component('apollo-subscribe-to-more', CApolloSubscribeToMore)
  Vue.component('ApolloSubscribeToMore', CApolloSubscribeToMore)
  Vue.component('apollo-mutation', CApolloMutation)
  Vue.component('ApolloMutation', CApolloMutation)
}

plugin.install = install

// eslint-disable-next-line no-undef
plugin.version = VERSION

// Apollo provider
export const ApolloProvider = plugin

// Components
export const ApolloQuery = CApolloQuery
export const ApolloSubscribeToMore = CApolloSubscribeToMore
export const ApolloMutation = CApolloMutation

// Auto-install
let GlobalVue = null
if (typeof window !== 'undefined') {
  GlobalVue = window.Vue
} else if (typeof global !== 'undefined') {
  GlobalVue = global.Vue
}
if (GlobalVue) {
  GlobalVue.use(plugin)
}

export default plugin
