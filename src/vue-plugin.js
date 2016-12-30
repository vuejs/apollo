import omit from 'lodash.omit'
import { print } from 'graphql-tag/printer'
import { SmartQuery, SmartSubscription } from './smart-apollo'

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
    const vm = this.vm
    const observable = this.client.watchQuery(options)
    const _subscribe = observable.subscribe.bind(observable)
    observable.subscribe = function (options) {
      let sub = _subscribe(options)
      vm._apolloSubscriptions.push(sub)
      return sub
    }
    return observable
  }

  get mutate () {
    return this.client.mutate
  }

  subscribe (options) {
    const vm = this.vm
    const observable = this.client.subscribe(options)
    const _subscribe = observable.subscribe.bind(observable)
    observable.subscribe = function (options) {
      let sub = _subscribe(options)
      vm._apolloSubscriptions.push(sub)
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
}

const prepare = function prepare () {
  this._apolloSubscriptions = []

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
  if (apollo && apollo.subscribe) {
    for (let key in apollo.subscribe) {
      this.$apollo.subscribeOption(key, apollo.subscribe[key])
    }
  }
}

module.exports = {
  addGraphQLSubscriptions,

  install (Vue, options) {
    defineReactive = Vue.util.defineReactive

    apolloClient = options.apolloClient

    Vue.mixin({

      // Vue 1.x
      init: prepare,
      // Vue 2.x
      beforeCreate: prepare,

      created: launch,

      destroyed: function () {
        this._apolloSubscriptions.forEach((sub) => {
          sub.unsubscribe()
        })
        this._apolloSubscriptions = null
        if (this._apollo) {
          this._apollo = null
        }
      },

    })
  },
}
