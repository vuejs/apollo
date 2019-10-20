import { throttle, debounce, omit, addGqlError } from '../lib/utils'

export default class SmartApollo {
  type = null
  vueApolloSpecialKeys = []

  constructor (vm, key, options, autostart = true) {
    this.vm = vm
    this.key = key
    this.initialOptions = options
    this.options = Object.assign({}, options)
    this._skip = false
    this._pollInterval = null
    this._watchers = []
    this._destroyed = false

    if (autostart) {
      this.autostart()
    }
  }

  autostart () {
    if (typeof this.options.skip === 'function') {
      this._skipWatcher = this.vm.$watch(() => this.options.skip.call(this.vm, this.vm, this.key), this.skipChanged.bind(this), {
        immediate: true,
        deep: this.options.deep,
      })
    } else if (!this.options.skip) {
      this.start()
    } else {
      this._skip = true
    }

    if (typeof this.options.pollInterval === 'function') {
      this._pollWatcher = this.vm.$watch(this.options.pollInterval.bind(this.vm), this.pollIntervalChanged.bind(this), { immediate: true })
    }
  }

  pollIntervalChanged (value, oldValue) {
    if (value !== oldValue) {
      this.pollInterval = value

      if (value == null) {
        this.stopPolling()
      } else {
        this.startPolling(value)
      }
    }
  }

  skipChanged (value, oldValue) {
    if (value !== oldValue) {
      this.skip = value
    }
  }

  get pollInterval () {
    return this._pollInterval
  }

  set pollInterval (value) {
    this._pollInterval = value
  }

  get skip () {
    return this._skip
  }

  set skip (value) {
    if (value) {
      this.stop()
    } else {
      this.start()
    }
    this._skip = value
  }

  refresh () {
    if (!this._skip) {
      this.stop()
      this.start()
    }
  }

  start () {
    this.starting = true

    // Reactive options
    for (const prop of ['query', 'document', 'context']) {
      if (typeof this.initialOptions[prop] === 'function') {
        const queryCb = this.initialOptions[prop].bind(this.vm)
        this.options[prop] = queryCb()
        let cb = query => {
          this.options[prop] = query
          this.refresh()
        }
        if (!this.vm.$isServer) {
          cb = this.options.throttle ? throttle(cb, this.options.throttle) : cb
          cb = this.options.debounce ? debounce(cb, this.options.debounce) : cb
        }
        this._watchers.push(this.vm.$watch(queryCb, cb, {
          deep: this.options.deep,
        }))
      }
    }

    // GraphQL Variables
    if (typeof this.options.variables === 'function') {
      let cb = this.executeApollo.bind(this)
      if (!this.vm.$isServer) {
        cb = this.options.throttle ? throttle(cb, this.options.throttle) : cb
        cb = this.options.debounce ? debounce(cb, this.options.debounce) : cb
      }
      this._watchers.push(this.vm.$watch(() => this.options.variables.call(this.vm), cb, {
        immediate: true,
        deep: this.options.deep,
      }))
    } else {
      this.executeApollo(this.options.variables)
    }
  }

  stop () {
    for (const unwatch of this._watchers) {
      unwatch()
    }

    if (this.sub) {
      this.sub.unsubscribe()
      this.sub = null
    }
  }

  generateApolloOptions (variables) {
    const apolloOptions = omit(this.options, this.vueApolloSpecialKeys)
    apolloOptions.variables = variables
    return apolloOptions
  }

  executeApollo (variables) {
    this.starting = false
  }

  nextResult (result) {
    const { error } = result
    if (error) addGqlError(error)
  }

  callHandlers (handlers, ...args) {
    let catched = false
    for (const handler of handlers) {
      if (handler) {
        catched = true
        let result = handler.apply(this.vm, args)
        if (typeof result !== 'undefined' && !result) {
          break
        }
      }
    }
    return catched
  }

  errorHandler (...args) {
    return this.callHandlers([
      this.options.error,
      this.vm.$apollo.error,
      this.vm.$apollo.provider.errorHandler,
    ], ...args)
  }

  catchError (error) {
    addGqlError(error)

    const catched = this.errorHandler(error, this.vm, this.key, this.type)

    if (catched) return

    if (error.graphQLErrors && error.graphQLErrors.length !== 0) {
      console.error(`GraphQL execution errors for ${this.type} '${this.key}'`)
      for (let e of error.graphQLErrors) {
        console.error(e)
      }
    } else if (error.networkError) {
      console.error(`Error sending the ${this.type} '${this.key}'`, error.networkError)
    } else {
      console.error(`[vue-apollo] An error has occurred for ${this.type} '${this.key}'`)
      if (Array.isArray(error)) {
        console.error(...error)
      } else {
        console.error(error)
      }
    }
  }

  destroy () {
    if (this._destroyed) return

    this._destroyed = true
    this.stop()
    if (this._skipWatcher) {
      this._skipWatcher()
    }
  }
}
