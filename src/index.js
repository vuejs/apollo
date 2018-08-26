import { DollarApollo } from './dollar-apollo'
import { ApolloProvider as plugin } from './apollo-provider'

import CApolloQuery from './components/ApolloQuery'
import CApolloSubscribeToMore from './components/ApolloSubscribeToMore'
import CApolloMutation from './components/ApolloMutation'

import { installMixin } from './mixin'
import { Globals, omit } from './utils'

const keywords = [
  '$subscribe',
]

export function install (Vue, options) {
  if (install.installed) return
  install.installed = true

  Globals.Vue = Vue
  const vueVersion = Vue.version.substr(0, Vue.version.indexOf('.'))

  // Options merging
  const merge = Vue.config.optionMergeStrategies.methods
  Vue.config.optionMergeStrategies.apollo = function (toVal, fromVal, vm) {
    if (!toVal) return fromVal
    if (!fromVal) return toVal

    const toData = Object.assign({}, omit(toVal, keywords), toVal.data)
    const fromData = Object.assign({}, omit(fromVal, keywords), fromVal.data)

    const map = {}
    for (let i = 0; i < keywords.length; i++) {
      const key = keywords[i]
      map[key] = merge(toVal[key], fromVal[key])
    }

    return Object.assign(map, merge(toData, fromData))
  }

  // Lazy creation
  Object.defineProperty(Vue.prototype, '$apollo', {
    get () {
      if (!this.$_apollo) {
        this.$_apollo = new DollarApollo(this)
      }
      return this.$_apollo
    },
  })

  installMixin(Vue, vueVersion)

  if (vueVersion === '2') {
    Vue.component('apollo-query', CApolloQuery)
    Vue.component('ApolloQuery', CApolloQuery)
    Vue.component('apollo-subscribe-to-more', CApolloSubscribeToMore)
    Vue.component('ApolloSubscribeToMore', CApolloSubscribeToMore)
    Vue.component('apollo-mutation', CApolloMutation)
    Vue.component('ApolloMutation', CApolloMutation)
  }
}

plugin.install = install

// eslint-disable-next-line no-undef
plugin.version = VERSION

// Apollo provider
export const ApolloProvider = plugin
export { willPrefetch } from './apollo-provider'

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
