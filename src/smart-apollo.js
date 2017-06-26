import omit from 'lodash.omit'
import { throttle, debounce } from './utils'
import { VUE_APOLLO_QUERY_KEYWORDS } from './consts'

class SmartApollo {
  type = null
  vueApolloSpecialKeys = []

  constructor (vm, key, options, autostart = true) {
    this.vm = vm
    this.key = key
    this.options = options
    this._skip = false
    this._watchers = []

    // Query callback
    if (typeof this.options.query === 'function') {
      const queryCb = this.options.query.bind(this.vm)
      this.options.query = queryCb()
      this._watchers.push(this.vm.$watch(queryCb, query => {
        this.options.query = query
        this.refresh()
      }))
    }

    if (autostart) {
      this.autostart()
    }
  }

  autostart () {
    if (typeof this.options.skip === 'function') {
      this._watchers.push(this.vm.$watch(this.options.skip.bind(this.vm), this.skipChanged.bind(this), {
        immediate: true,
      }))
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
    if (!this._skip) {
      this.stop()
      this.start()
    }
  }

  start () {
    this.starting = true
    if (typeof this.options.variables === 'function') {
      let cb = this.executeApollo.bind(this)
      cb = this.options.throttle ? throttle(cb, this.options.throttle) : cb
      cb = this.options.debounce ? debounce(cb, this.options.debounce) : cb
      this.unwatchVariables = this.vm.$watch(() => this.options.variables.bind(this.vm)(), cb, {
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
    const apolloOptions = omit(this.options, this.vueApolloSpecialKeys)
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
      console.error(`GraphQL execution errors for ${this.type} '${this.key}'`)
      for (let e of error.graphQLErrors) {
        console.error(e)
      }
    } else if (error.networkError) {
      console.error(`Error sending the ${this.type} '${this.key}'`, error.networkError)
    } else {
      console.error(`[vue-apollo] An error has occured for ${this.type} '${this.key}'`)
      if (Array.isArray(error)) {
        console.error(...error)
      } else {
        console.error(error)
      }
    }

    if (typeof this.options.error === 'function') {
      this.options.error.call(this.vm, error)
    }
  }

  destroy () {
    this.stop()
    for (const unwatch of this._watchers) {
      unwatch()
    }
  }
}

export class SmartQuery extends SmartApollo {
  type = 'query'
  vueApolloSpecialKeys = VUE_APOLLO_QUERY_KEYWORDS
  loading = false

  constructor (vm, key, options, autostart = true) {
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

    super(vm, key, options, autostart)
  }

  stop () {
    super.stop()

    if (this.observer) {
      this.observer.stopPolling()
      this.observer = null
    }
  }

  executeApollo (variables) {
    if (this.observer) {
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

    this.maySetLoading()

    super.executeApollo(variables)
  }

  maySetLoading (force = false) {
    const currentResult = this.observer.currentResult()
    if (force || currentResult.loading) {
      if (!this.loading) {
        this.applyLoadingModifier(1)
      }
      this.loading = true
    }
  }

  nextResult (result) {
    const { data, loading } = result

    if (!loading) {
      this.loadingDone()
    }

    if (typeof data === 'undefined') {
      // No result
    } else if (typeof this.options.update === 'function') {
      this.vm[this.key] = this.options.update.call(this.vm, data)
    } else if (data[this.key] === undefined) {
      console.error(`Missing ${this.key} attribute on result`, data)
    } else {
      this.vm[this.key] = data[this.key]
    }

    if (typeof this.options.result === 'function') {
      this.options.result.call(this.vm, result)
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

    if (this.options.watchLoading) {
      this.options.watchLoading.call(this.vm, value === 1, value)
    }
  }

  loadingDone () {
    if (this.loading) {
      this.applyLoadingModifier(-1)
    }
    this.loading = false
  }

  fetchMore (...args) {
    if (this.observer) {
      this.maySetLoading(true)
      return this.observer.fetchMore(...args)
    }
  }

  subscribeToMore (...args) {
    if (this.observer) {
      return {
        unsubscribe: this.observer.subscribeToMore(...args),
      }
    }
  }

  refetch (variables) {
    variables && (this.options.variables = variables)
    if (this.observer) {
      const result = this.observer.refetch(variables).then((result) => {
        if (!result.loading) {
          this.loadingDone()
        }
      })
      this.maySetLoading()
      return result
    }
  }

  setVariables (variables, tryFetch) {
    this.options.variables = variables
    if (this.observer) {
      const result = this.observer.setVariables(variables, tryFetch)
      this.maySetLoading()
      return result
    }
  }

  setOptions (options) {
    Object.assign(this.options, options)
    if (this.observer) {
      const result = this.observer.setOptions(options)
      this.maySetLoading()
      return result
    }
  }

  startPolling (...args) {
    if (this.observer) {
      return this.observer.startPolling(...args)
    }
  }

  stopPolling (...args) {
    if (this.observer) {
      return this.observer.stopPolling(...args)
    }
  }
}

export class SmartSubscription extends SmartApollo {
  type = 'subscription'
  vueApolloSpecialKeys = [
    'variables',
    'result',
    'error',
    'throttle',
    'debounce',
  ]

  constructor (vm, key, options, autostart = true) {
    // Options object callback
    while (typeof options === 'function') {
      options = options.call(vm)
    }

    super(vm, key, options, autostart)
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
