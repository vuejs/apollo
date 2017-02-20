import omit from 'lodash.omit'
import { print } from 'graphql-tag/printer'
import { SmartQuery, SmartSubscription } from './smart-apollo'

let Vue
let apolloClient = null

let defineReactive = function () {}

// quick way to add the subscribe and unsubscribe functions to the network interface
function addGraphQLSubscriptions (networkInterface, wsClient) {
  return Object.assign(networkInterface, {
    subscribe (request, handler) {
      return wsClient.subscribe({
        query: print(request.query),
        variables: request.variables,
      }, handler)
    },
    unsubscribe (id) {
      wsClient.unsubscribe(id)
    },
  })
}

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
      console.log(value)
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

const prepare = function prepare () {
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
    this._apolloQueries = omit(apollo, [
      'subscribe',
      '$subscribe',
      '$skipAll',
      '$skipAllQueries',
      '$skipAllSubscriptions',
    ])

    // watchQuery
    for (let key in this._apolloQueries) {
      // this.$data[key] = null;
      defineReactive(this, key, null)
    }
  }
}

const launch = function launch () {
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
      for (let key in apollo.subscribe) {
        this.$apollo.subscribeOption(key, apollo.subscribe[key])
      }
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

module.exports = {
  addGraphQLSubscriptions,

  install (pVue, options) {
    Vue = pVue
    defineReactive = Vue.util.defineReactive
    apolloClient = options.apolloClient

    Vue.mixin({

      // Vue 1.x
      init: prepare,
      // Vue 2.x
      beforeCreate: prepare,

      created: launch,

      destroyed: function () {
        if (this._apollo) {
          this._apollo.destroy()
          this._apollo = null
        }
      },

    })
  },
}
