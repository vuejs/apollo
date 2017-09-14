import omit from 'lodash.omit'
import { throttle, debounce } from './utils'
import { VUE_APOLLO_QUERY_KEYWORDS } from './consts'

class SmartApollo {
  type = null
  vueApolloSpecialKeys = []

  constructor (vm, key, options, autostart = true) {
    this.vm = vm
    this.key = key
    this.options = Object.assign({}, options)
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
    // Query callback
    if (typeof this.options.document === 'function') {
      const queryCb = this.options.document.bind(this.vm)
      this.options.document = queryCb()
      this._watchers.push(this.vm.$watch(queryCb, document => {
        this.options.document = document
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
      this.unwatchVariables = this.vm.$watch(() => this.options.variables.call(this.vm), cb, {
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

  errorHandler (...args) {
    this.options.error && this.options.error.call(this.vm, ...args)
    this.vm.$apollo.error && this.vm.$apollo.error.call(this.vm, ...args)
    this.vm.$apollo.provider.errorHandler && this.vm.$apollo.provider.errorHandler.call(this.vm, ...args)
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

    this.errorHandler(error)
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

    const hasResultCallback = typeof this.options.result === 'function'

    if (typeof data === 'undefined') {
      // No result
    } else if (typeof this.options.update === 'function') {
      this.vm[this.key] = this.options.update.call(this.vm, data)
    } else if (data[this.key] === undefined) {
      console.error(`Missing ${this.key} attribute on result`, data)
    } else if (!this.options.manual) {
      this.vm[this.key] = data[this.key]
    } else if (!hasResultCallback) {
      console.error(`${this.key} query must have a 'result' hook in manual mode`)
    }

    if (hasResultCallback) {
      this.options.result.call(this.vm, result)
    }
  }

  catchError (error) {
    super.catchError(error)
    this.loadingDone()
  }

  get loadingKey () {
    return this.options.loadingKey || this.vm.$apollo.loadingKey
  }

  watchLoading (...args) {
    this.options.watchLoading && this.options.watchLoading.call(this.vm, ...args)
    this.vm.$apollo.watchLoading && this.vm.$apollo.watchLoading.call(this.vm, ...args)
    this.vm.$apollo.provider.watchLoading && this.vm.$apollo.provider.watchLoading.call(this.vm, ...args)
  }

  applyLoadingModifier (value) {
    const loadingKey = this.loadingKey
    if (loadingKey && typeof this.vm[loadingKey] === 'number') {
      this.vm[loadingKey] += value
    }

    this.watchLoading(value === 1, value)
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
      return this.observer.fetchMore(...args).then(result => {
        if (!result.loading) {
          this.loadingDone()
        }
        return result
      })
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
        return result
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
    'linkedQuery',
  ]

  executeApollo (variables) {
    const variablesJson = JSON.stringify(variables)
    if (this.sub) {
      // do nothing if subscription is already running using exactly the same variables
      if (variablesJson === this.previousVariablesJson) {
        return
      }
      this.sub.unsubscribe()
    }
    this.previousVariablesJson = variablesJson

    const apolloOptions = this.generateApolloOptions(variables)

    if (this.options.linkedQuery) {
      this.sub = this.options.linkedQuery.subscribeToMore(apolloOptions)
    } else {
      // Create observer
      this.observer = this.vm.$apollo.subscribe(apolloOptions)

      // Create subscription
      this.sub = this.observer.subscribe({
        next: this.nextResult.bind(this),
        error: this.catchError.bind(this),
      })
    }

    super.executeApollo(variables)
  }

  nextResult (data) {
    if (typeof this.options.result === 'function') {
      this.options.result.call(this.vm, data)
    }
  }
}
