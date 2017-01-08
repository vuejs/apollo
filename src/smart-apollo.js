import omit from 'lodash.omit'

class SmartApollo {
  type = null
  apolloOptionsKeys = []

  constructor (vm, key, options) {
    this.vm = vm
    this.key = key
    this.options = options
    this._skip = false

    // Query callback
    if (typeof this.options.query === 'function') {
      const queryCb = this.options.query.bind(this.vm)
      this.options.query = queryCb()
      this.vm.$watch(queryCb, query => {
        this.options.query = query
        this.refresh()
      })
    }

    this.autostart()
  }

  autostart () {
    if (typeof this.options.skip === 'function') {
      this.vm.$watch(this.options.skip.bind(this.vm), this.skipChanged.bind(this), {
        immediate: true,
      })
    } else if (!this.options.skip) {
      this.start()
    } else {
      this._skip = true
    }
  }

  skipChanged (value, oldValue) {
    if (value !== oldValue) {
      this.skip = value
    }
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
    this.stop()
    this.start()
  }

  start () {
    this.starting = true
    if (typeof this.options.variables === 'function') {
      this.unwatchVariables = this.vm.$watch(this.options.variables.bind(this.vm), this.executeApollo.bind(this), {
        immediate: true,
      })
    } else {
      this.executeApollo(this.options.variables)
    }
  }

  stop () {
    if (this.unwatchVariables) {
      this.unwatchVariables()
      this.unwatchVariables = null
    }

    if (this.sub) {
      this.sub.unsubscribe()
      this.sub = null
    }
  }

  generateApolloOptions (variables) {
    const apolloOptions = omit(this.options, this.apolloOptionsKeys)
    apolloOptions.variables = variables
    return apolloOptions
  }

  executeApollo (variables) {
    this.starting = false
  }

  nextResult () {
    throw new Error('Not implemented')
  }

  catchError (error) {
    if (error.graphQLErrors && error.graphQLErrors.length !== 0) {
      console.error(`GraphQL execution errors for ${this.type} ${this.key}`)
      for (let e of error.graphQLErrors) {
        console.error(e)
      }
    } else if (error.networkError) {
      console.error(`Error sending the ${this.type} ${this.key}`, error.networkError)
    } else {
      console.error(error)
    }

    if (typeof this.options.error === 'function') {
      this.options.error.call(this.vm, error)
    }
  }
}

export class SmartQuery extends SmartApollo {
  type = 'query'
  apolloOptionsKeys = [
    'variables',
    'watch',
    'update',
    'result',
    'error',
    'loadingKey',
    'watchLoading',
    'skip',
  ]

  constructor (vm, key, options) {
    // Options object callback
    while (typeof options === 'function') {
      options = options.call(vm)
    }

    // Simple query
    if (!options.query) {
      const query = options
      options = {
        query,
      }
    }

    super(vm, key, options)
  }

  stop () {
    super.stop()

    if (this.observer) {
      this.observer.stopPolling()
      this.observer = null
    }
  }

  executeApollo (variables) {
    const oldForceFetch = this.options.forceFetch
    if (this.starting) {
      this.options.forceFetch = true
    }

    if (this.options.forceFetch && this.observer) {
      // Refresh query
      this.observer.refetch(variables, {
        forceFetch: !!this.options.forceFetch,
      })
    } else if (this.observer) {
      // Update variables
      // Don't use setVariables directly or it will ignore cache
      this.observer.setOptions(this.generateApolloOptions(variables))
    } else {
      if (this.sub) {
        this.sub.unsubscribe()
      }

      // Create observer
      this.observer = this.vm.$apollo.watchQuery(this.generateApolloOptions(variables))

      // Create subscription
      this.sub = this.observer.subscribe({
        next: this.nextResult.bind(this),
        error: this.catchError.bind(this),
      })
    }

    const currentResult = this.observer.currentResult()
    if (currentResult.loading) {
      if (!this.loading) {
        this.applyLoadingModifier(1)
      }
      this.loading = true
    }

    this.options.forceFetch = oldForceFetch

    super.executeApollo(variables)
  }

  nextResult ({ data }) {
    this.loadingDone()

    if (typeof this.options.update === 'function') {
      this.vm[this.key] = this.options.update.call(this.vm, data)
    } else if (data[this.key] === undefined) {
      console.error(`Missing ${this.key} attribute on result`, data)
    } else {
      this.vm[this.key] = data[this.key]
    }

    if (typeof this.options.result === 'function') {
      this.options.result.call(this.vm, data)
    }
  }

  catchError (error) {
    super.catchError(error)
    this.loadingDone()
  }

  applyLoadingModifier (value) {
    if (this.options.loadingKey) {
      this.vm[this.options.loadingKey] += value
    }

    if (this.options.loadingChangeCb) {
      this.options.loadingChangeCb.call(this.vm, value === 1, value)
    }
  }

  loadingDone () {
    if (this.loading) {
      this.applyLoadingModifier(-1)
    }
    this.loading = false
  }

  get fetchMore () {
    return this.observer.fetchMore.bind(this.observer)
  }
}

export class SmartSubscription extends SmartApollo {
  type = 'subscription'
  apolloOptionsKeys = [
    'variables',
    'result',
    'error',
  ]

  constructor (vm, key, options) {
    // Options object callback
    while (typeof options === 'function') {
      options = options.call(vm)
    }

    super(vm, key, options)
  }

  executeApollo (variables) {
    if (this.sub) {
      this.sub.unsubscribe()
    }

    // Create observer
    this.observer = this.vm.$apollo.subscribe(this.generateApolloOptions(variables))

    // Create subscription
    this.sub = this.observer.subscribe({
      next: this.nextResult.bind(this),
      error: this.catchError.bind(this),
    })

    super.executeApollo(variables)
  }

  nextResult (data) {
    if (typeof this.options.result === 'function') {
      this.options.result.call(this.vm, data)
    }
  }
}
