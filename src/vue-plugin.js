import omit from 'lodash.omit'
import { SmartQuery, SmartSubscription } from './smart-apollo'

let Vue
let apolloClient = null

const keywords = [
  '$subscribe',
  '$skipAll',
  '$skipAllQueries',
  '$skipAllSubscriptions',
]

class DollarApollo {
  constructor (vm) {
    this._apolloSubscriptions = []
    this._watchers = []

    this.vm = vm
    this.queries = {}
    this.subscriptions = {}
  }

  get client () {
    return apolloClient
  }

  get query () {
    return this.client.query
  }

  watchQuery (options) {
    const observable = this.client.watchQuery(options)
    const _subscribe = observable.subscribe.bind(observable)
    observable.subscribe = (options) => {
      let sub = _subscribe(options)
      this._apolloSubscriptions.push(sub)
      return sub
    }
    return observable
  }

  get mutate () {
    return this.client.mutate
  }

  subscribe (options) {
    const observable = this.client.subscribe(options)
    const _subscribe = observable.subscribe.bind(observable)
    observable.subscribe = (options) => {
      let sub = _subscribe(options)
      this._apolloSubscriptions.push(sub)
      return sub
    }
    return observable
  }

  option (key, options) {
    this.queries[key] = new SmartQuery(this.vm, key, options)
  }

  subscribeOption (key, options) {
    this.subscriptions[key] = new SmartSubscription(this.vm, key, options)
  }

  defineReactiveSetter (key, func) {
    this._watchers.push(this.vm.$watch(func, value => {
      this[key] = value
    }, {
      immediate: true,
    }))
  }

  set skipAllQueries (value) {
    for (let key in this.queries) {
      this.queries[key].skip = value
    }
  }

  set skipAllSubscriptions (value) {
    for (let key in this.subscriptions) {
      this.subscriptions[key].skip = value
    }
  }

  set skipAll (value) {
    this.skipAllQueries = value
    this.skipAllSubscriptions = value
  }

  destroy () {
    for (const unwatch of this._watchers) {
      unwatch()
    }
    for (let key in this.queries) {
      this.queries[key].destroy()
    }
    for (let key in this.subscriptions) {
      this.subscriptions[key].destroy()
    }
    this._apolloSubscriptions.forEach((sub) => {
      sub.unsubscribe()
    })
    this._apolloSubscriptions = null
    this.vm = null
  }
}

function noop () {}

const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop,
}

export function proxy (target, sourceKey, key) {
  sharedPropertyDefinition.get = function proxyGetter () {
    return this[sourceKey][key]
  }
  sharedPropertyDefinition.set = function proxySetter (val) {
    this[sourceKey][key] = val
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}

const prepare = function prepare () {
  if (this._apolloPrepared) return
  this._apolloPrepared = true

  // Lazy creation
  Object.defineProperty(this, '$apollo', {
    get: () => {
      if (!this._apollo) {
        this._apollo = new DollarApollo(this)
      }
      return this._apollo
    },
  })

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

export default function install (pVue, options) {
  if (install.installed) return
  install.installed = true

  Vue = pVue
  apolloClient = options.apolloClient

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
