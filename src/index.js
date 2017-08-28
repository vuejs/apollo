import omit from 'lodash.omit'
import { DollarApollo } from './dollar-apollo'
import { ApolloProvider as apolloProvider } from './apollo-provider'
import { Globals } from './utils'

const keywords = [
  '$subscribe',
]

const prepare = function prepare () {
  let apolloProvider
  if (this.$options.apolloProvider) {
    apolloProvider = this._apolloProvider = this.$options.apolloProvider
  } else {
    apolloProvider = this.$root._apolloProvider
  }

  if (this._apolloPrepared) return
  this._apolloPrepared = true

  // Prepare properties
  let apollo = this.$options.apollo

  if (apollo) {
    this._apolloQueries = {}
    this._apolloInitData = {}
    this.$apollo = new DollarApollo(this)

    if (!apollo.$init) {
      apollo.$init = true

      // Default options applied to `apollo` options
      if (apolloProvider.defaultOptions) {
        apollo = this.$options.apollo = Object.assign({}, apolloProvider.defaultOptions, apollo)
      }
    }

    // watchQuery
    for (let key in apollo) {
      if (key.charAt(0) !== '$') {
        this._apolloInitData[key] = null
        this._apolloQueries[key] = apollo[key]
      }
    }
  }
}

const launch = function launch () {
  if (this._apolloLaunched) return
  this._apolloLaunched = true

  let apollo = this.$options.apollo
  if (apollo) {
    defineReactiveSetter(this.$apollo, 'skipAll', apollo.$skipAll)
    defineReactiveSetter(this.$apollo, 'skipAllQueries', apollo.$skipAllQueries)
    defineReactiveSetter(this.$apollo, 'skipAllSubscriptions', apollo.$skipAllSubscriptions)
    defineReactiveSetter(this.$apollo, 'client', apollo.$client)
    defineReactiveSetter(this.$apollo, 'loadingKey', apollo.$loadingKey)
    defineReactiveSetter(this.$apollo, 'error', apollo.$error)
    defineReactiveSetter(this.$apollo, 'watchLoading', apollo.$watchLoading)
  }

  if (this._apolloQueries) {
    // watchQuery
    for (let key in this._apolloQueries) {
      this.$apollo.addSmartQuery(key, this._apolloQueries[key])
    }
  }

  if (apollo) {
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

function defineReactiveSetter ($apollo, key, value) {
  if (typeof value !== 'undefined') {
    if (typeof value === 'function') {
      $apollo.defineReactiveSetter(key, value)
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

  Vue.mixin({

    // Vue 1.x
    init: prepare,
    // Vue 2.x
    beforeCreate: prepare,

    // Better devtools support
    data () {
      return this._apolloInitData || {}
    },

    created: launch,

    destroyed: function () {
      if (this._apollo) {
        this._apollo.destroy()
        this._apollo = null
      }
    },

  })
}

apolloProvider.install = install

export const ApolloProvider = apolloProvider

export { willPrefetch } from './apollo-provider'

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
