import SmartQuery from './smart-query'
import SmartSubscription from './smart-subscription'
import { reapply } from '../lib/utils'

export class DollarApollo {
  constructor (vm, provider) {
    this._apolloSubscriptions = []
    this._watchers = []

    this.vm = vm
    this.provider = provider
    this.queries = {}
    this.subscriptions = {}
    this.client = undefined
    this.loadingKey = undefined
    this.error = undefined
  }

  getClient (options = null) {
    if (!options || !options.client) {
      if (typeof this.client === 'object') {
        return this.client
      }
      if (this.client) {
        if (!this.provider.clients) {
          throw new Error(`[vue-apollo] Missing 'clients' options in 'apolloProvider'`)
        } else {
          const client = this.provider.clients[this.client]
          if (!client) {
            throw new Error(`[vue-apollo] Missing client '${this.client}' in 'apolloProvider'`)
          }
          return client
        }
      }
      return this.provider.defaultClient
    }
    const client = this.provider.clients[options.client]
    if (!client) {
      throw new Error(`[vue-apollo] Missing client '${options.client}' in 'apolloProvider'`)
    }
    return client
  }

  query (options) {
    return this.getClient(options).query(options)
  }

  watchQuery (options) {
    const observable = this.getClient(options).watchQuery(options)
    const _subscribe = observable.subscribe.bind(observable)
    observable.subscribe = (options) => {
      const sub = _subscribe(options)
      this._apolloSubscriptions.push(sub)
      return sub
    }
    return observable
  }

  mutate (options) {
    return this.getClient(options).mutate(options)
  }

  subscribe (options) {
    if (!this.vm.$isServer) {
      const observable = this.getClient(options).subscribe(options)
      const _subscribe = observable.subscribe.bind(observable)
      observable.subscribe = (options) => {
        const sub = _subscribe(options)
        this._apolloSubscriptions.push(sub)
        return sub
      }
      return observable
    }
  }

  get loading () {
    return this.vm.$data.$apolloData.loading !== 0
  }

  get data () {
    return this.vm.$data.$apolloData.data
  }

  addSmartQuery (key, options) {
    let finalOptions = reapply(options, this.vm)

    // Simple query
    if (!finalOptions.query) {
      const query = finalOptions
      finalOptions = {
        query,
      }
    }

    const apollo = this.vm.$options.apollo
    const defaultOptions = this.provider.defaultOptions
    let $query
    if (defaultOptions && defaultOptions.$query) {
      $query = defaultOptions.$query
    }
    if (apollo && apollo.$query) {
      $query = {
        ...$query || {},
        ...apollo.$query,
      }
    }
    if ($query) {
      // Also replaces 'undefined' values
      for (const key in $query) {
        if (typeof finalOptions[key] === 'undefined') {
          finalOptions[key] = $query[key]
        }
      }
    }

    const smart = this.queries[key] = new SmartQuery(this.vm, key, finalOptions, false)
    if (!this.vm.$isServer || finalOptions.prefetch !== false) {
      smart.autostart()
    }

    if (!this.vm.$isServer) {
      const subs = finalOptions.subscribeToMore
      if (subs) {
        if (Array.isArray(subs)) {
          subs.forEach((sub, index) => {
            this.addSmartSubscription(`${key}${index}`, {
              ...sub,
              linkedQuery: smart,
            })
          })
        } else {
          this.addSmartSubscription(key, {
            ...subs,
            linkedQuery: smart,
          })
        }
      }
    }

    return smart
  }

  addSmartSubscription (key, options) {
    if (!this.vm.$isServer) {
      options = reapply(options, this.vm)

      const smart = this.subscriptions[key] = new SmartSubscription(this.vm, key, options, false)
      smart.autostart()

      if (options.linkedQuery) {
        // prevent subscriptions leak on fetching query with another parameters
        const index = options.linkedQuery._linkedSubscriptions.findIndex(x => x.key === key)
        if (index !== -1) {
          options.linkedQuery._linkedSubscriptions[index] = smart
        } else {
          options.linkedQuery._linkedSubscriptions.push(smart)
        }
      }

      return smart
    }
  }

  defineReactiveSetter (key, func, deep) {
    this._watchers.push(this.vm.$watch(func, value => {
      this[key] = value
    }, {
      immediate: true,
      deep,
    }))
  }

  set skipAllQueries (value) {
    for (const key in this.queries) {
      this.queries[key].skip = value
    }
  }

  set skipAllSubscriptions (value) {
    for (const key in this.subscriptions) {
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
    for (const key in this.queries) {
      this.queries[key].destroy()
    }
    for (const key in this.subscriptions) {
      this.subscriptions[key].destroy()
    }
    this._apolloSubscriptions.forEach((sub) => {
      sub.unsubscribe()
    })
    this._apolloSubscriptions = null
    this.vm = null
  }
}
