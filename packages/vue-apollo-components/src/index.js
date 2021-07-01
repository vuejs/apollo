import CApolloQuery from './ApolloQuery'
import CApolloSubscribeToMore from './ApolloSubscribeToMore'
import CApolloMutation from './ApolloMutation'

const plugin = {}

export function install (app, options) {
  app.component('ApolloQuery', CApolloQuery)
  app.component('ApolloQuery', CApolloQuery)
  app.component('ApolloSubscribeToMore', CApolloSubscribeToMore)
  app.component('ApolloSubscribeToMore', CApolloSubscribeToMore)
  app.component('ApolloMutation', CApolloMutation)
  app.component('ApolloMutation', CApolloMutation)
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
