import omit from 'lodash.omit'
import { DollarApollo } from './dollar-apollo'
import { ApolloProvider } from './apollo-provider'

let Vue

const keywords = [
  '$subscribe',
  '$skipAll',
  '$skipAllQueries',
  '$skipAllSubscriptions',
  '$client',
]

const prepare = function prepare () {
  if (this.$options.apolloProvider) {
    this._apolloProvider = this.$options.apolloProvider
  }

  if (this._apolloPrepared) return
  this._apolloPrepared = true

  // Prepare properties
  let apollo = this.$options.apollo
  if (apollo) {
    this._apolloQueries = {}
    this._apolloInitData = {}

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

  if (this._apolloQueries) {
    // watchQuery
    for (let key in this._apolloQueries) {
      this.$apollo.option(key, this._apolloQueries[key])
    }
  }

  let apollo = this.$options.apollo
  if (apollo) {
    if (apollo.subscribe) {
      Vue.util.warn('vue-apollo -> `subscribe` option is deprecated. Use the `$subscribe` option instead.')
    }

    if (apollo.$subscribe) {
      for (let key in apollo.$subscribe) {
        this.$apollo.subscribeOption(key, apollo.$subscribe[key])
      }
    }

    defineReactiveSetter(this.$apollo, 'skipAll', apollo.$skipAll)
    defineReactiveSetter(this.$apollo, 'skipAllQueries', apollo.$skipAllQueries)
    defineReactiveSetter(this.$apollo, 'skipAllSubscriptions', apollo.$skipAllSubscriptions)
    defineReactiveSetter(this.$apollo, 'client', apollo.$client)
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

function install (pVue, options) {
  if (install.installed) return
  install.installed = true

  Vue = pVue

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

ApolloProvider.install = install

export default ApolloProvider
