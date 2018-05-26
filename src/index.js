import { DollarApollo } from './dollar-apollo'
import { ApolloProvider as apolloProvider } from './apollo-provider'
import CApolloQuery from './components/ApolloQuery'
import CApolloSubscribeToMore from './components/ApolloSubscribeToMore'
import CApolloMutation from './components/ApolloMutation'
import { Globals, omit } from './utils'

const keywords = [
  '$subscribe',
]

function hasProperty (holder, key) {
  return typeof holder !== 'undefined' && holder.hasOwnProperty(key)
}

function proxyData () {
  let apollo = this.$options.apollo

  if (apollo) {
    // watchQuery
    for (let key in apollo) {
      if (key.charAt(0) !== '$') {
        let options = apollo[key]
        // Property proxy
        if (!options.manual && !hasProperty(this.$options.props, key) && !hasProperty(this.$options.computed, key) && !hasProperty(this.$options.methods, key)) {
          Object.defineProperty(this, key, {
            get: () => this.$data.$apolloData.data[key],
            enumerable: true,
            configurable: true,
          })
        }
      }
    }
  }
}

function launch () {
  const apolloProvider = this.$apolloProvider

  if (this._apolloLaunched || !apolloProvider) return
  this._apolloLaunched = true

  // Prepare properties
  let apollo = this.$options.apollo

  if (apollo) {
    if (!apollo.$init) {
      apollo.$init = true

      // Default options applied to `apollo` options
      if (apolloProvider.defaultOptions) {
        apollo = this.$options.apollo = Object.assign({}, apolloProvider.defaultOptions, apollo)
      }
    }

    defineReactiveSetter(this.$apollo, 'skipAll', apollo.$skipAll, apollo.$deep)
    defineReactiveSetter(this.$apollo, 'skipAllQueries', apollo.$skipAllQueries, apollo.$deep)
    defineReactiveSetter(this.$apollo, 'skipAllSubscriptions', apollo.$skipAllSubscriptions, apollo.$deep)
    defineReactiveSetter(this.$apollo, 'client', apollo.$client, apollo.$deep)
    defineReactiveSetter(this.$apollo, 'loadingKey', apollo.$loadingKey, apollo.$deep)
    defineReactiveSetter(this.$apollo, 'error', apollo.$error, apollo.$deep)
    defineReactiveSetter(this.$apollo, 'watchLoading', apollo.$watchLoading, apollo.$deep)

    // Apollo Data
    Object.defineProperty(this, '$apolloData', {
      get: () => this.$data.$apolloData,
      enumerable: true,
      configurable: true,
    })

    // watchQuery
    for (let key in apollo) {
      if (key.charAt(0) !== '$') {
        let options = apollo[key]
        this.$apollo.addSmartQuery(key, options)
      }
    }

    if (apollo.subscribe) {
      Globals.Vue.util.warn('vue-apollo -> `subscribe` option is deprecated. Use the `$subscribe` option instead.')
    }

    if (apollo.$subscribe) {
      for (let key in apollo.$subscribe) {
        this.$apollo.addSmartSubscription(key, apollo.$subscribe[key])
      }
    }
  }
}

function defineReactiveSetter ($apollo, key, value, deep) {
  if (typeof value !== 'undefined') {
    if (typeof value === 'function') {
      $apollo.defineReactiveSetter(key, value, deep)
    } else {
      $apollo[key] = value
    }
  }
}

export function install (Vue, options) {
  if (install.installed) return
  install.installed = true

  Globals.Vue = Vue

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
      if (!this._apollo) {
        this._apollo = new DollarApollo(this)
      }
      return this._apollo
    },
  })

  const vueVersion = Vue.version.substr(0, Vue.version.indexOf('.'))

  Vue.mixin({
    ...vueVersion === '1' ? {
      init () {
        let apolloProvider
        if (this.$options.apolloProvider) {
          apolloProvider = this._apolloProvider = this.$options.apolloProvider
        } else {
          apolloProvider = this.$root._apolloProvider
        }
        this.$apolloProvider = apolloProvider
      },
    } : {},

    ...vueVersion === '2' ? {
      inject: {
        $apolloProvider: { default: null },
      },

      data () {
        return {
          '$apolloData': {
            queries: {},
            loading: 0,
            data: {},
          },
        }
      },
    } : {},

    beforeCreate: proxyData,
    created: launch,

    destroyed: function () {
      if (this._apollo) {
        this._apollo.destroy()
        this._apollo = null
      }
    },

  })

  if (vueVersion === '2') {
    Vue.component('apollo-query', CApolloQuery)
    Vue.component('ApolloQuery', CApolloQuery)
    Vue.component('apollo-subscribe-to-more', CApolloSubscribeToMore)
    Vue.component('ApolloSubscribeToMore', CApolloSubscribeToMore)
    Vue.component('apollo-mutation', CApolloMutation)
    Vue.component('ApolloMutation', CApolloMutation)
  }
}

apolloProvider.install = install

// eslint-disable-next-line no-undef
apolloProvider.version = VERSION

// Apollo provider
export const ApolloProvider = apolloProvider
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
  GlobalVue.use(apolloProvider)
}

export default apolloProvider
