import SmartApollo from './smart-apollo'
import { VUE_APOLLO_QUERY_KEYWORDS } from '../lib/consts'
import { isServer } from './env'

export default class SmartQuery extends SmartApollo {
  type = 'query'
  vueApolloSpecialKeys = VUE_APOLLO_QUERY_KEYWORDS
  _loading = false
  _linkedSubscriptions = []

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  constructor (vm, key, options, autostart = true) {
    // Add reactive data related to the query
    if (vm.$data.$apolloData && !vm.$data.$apolloData.queries[key]) {
      vm.$data.$apolloData.queries[key] = {
        loading: false,
      }
    }

    super(vm, key, options)

    if (isServer) {
      this.firstRun = new Promise((resolve, reject) => {
        this._firstRunResolve = resolve
        this._firstRunReject = reject
      })
    }

    if (isServer) {
      this.options.fetchPolicy = 'network-only'
    }

    if (!options.manual) {
      this.hasDataField = Object.prototype.hasOwnProperty.call(this.vm.$data, key)
      if (this.hasDataField) {
        Object.defineProperty(this.vm.$data.$apolloData.data, key, {
          get: () => this.vm.$data[key],
          enumerable: true,
          configurable: true,
        })
      } else {
        Object.defineProperty(this.vm.$data, key, {
          get: () => this.vm.$data.$apolloData.data[key],
          enumerable: true,
          configurable: true,
        })
      }
    }

    if (autostart) {
      this.autostart()
    }
  }

  get client () {
    return this.vm.$apollo.getClient(this.options)
  }

  get loading () {
    return this.vm.$data.$apolloData && this.vm.$data.$apolloData.queries[this.key] ? this.vm.$data.$apolloData.queries[this.key].loading : this._loading
  }

  set loading (value) {
    if (this._loading !== value) {
      this._loading = value
      if (this.vm.$data.$apolloData && this.vm.$data.$apolloData.queries[this.key]) {
        this.vm.$data.$apolloData.queries[this.key].loading = value
        this.vm.$data.$apolloData.loading += value ? 1 : -1
      }
    }
  }

  stop () {
    super.stop()

    this.loadingDone()

    if (this.observer) {
      this.observer.stopPolling()
      this.observer = null
    }
  }

  generateApolloOptions (variables) {
    const apolloOptions = super.generateApolloOptions(variables)

    if (this.vm.$isServer) {
      // Don't poll on the server, that would run indefinitely
      delete apolloOptions.pollInterval
    }

    return apolloOptions
  }

  executeApollo (variables) {
    if (this._destroyed) return

    const variablesJson = JSON.stringify(variables)

    if (this.sub) {
      if (variablesJson === this.previousVariablesJson) {
        return
      }
      this.sub.unsubscribe()

      // Subscribe to more subs
      for (const sub of this._linkedSubscriptions) {
        sub.stop()
      }
    }

    this.previousVariablesJson = variablesJson

    // Create observer
    this.observer = this.vm.$apollo.watchQuery(this.generateApolloOptions(variables))

    this.startQuerySubscription()

    if (this.options.fetchPolicy !== 'no-cache' || this.options.notifyOnNetworkStatusChange) {
      const currentResult = this.retrieveCurrentResult()

      if (this.options.notifyOnNetworkStatusChange ||
        // Initial call of next result when it's not loading (for Apollo Client 3)
        (this.observer.getCurrentResult && !currentResult.loading)) {
        this.nextResult(currentResult)
      }
    }

    super.executeApollo(variables)

    // Subscribe to more subs
    for (const sub of this._linkedSubscriptions) {
      sub.start()
    }
  }

  startQuerySubscription () {
    if (this.sub && !this.sub.closed) return

    // Create subscription
    this.sub = this.observer.subscribe({
      next: this.nextResult.bind(this),
      error: this.catchError.bind(this),
    })
  }

  /**
   * May update loading state
   */
  retrieveCurrentResult (force = false) {
    const currentResult = this.observer.getCurrentResult ? this.observer.getCurrentResult() : this.observer.currentResult()
    if (force || currentResult.loading) {
      if (!this.loading) {
        this.applyLoadingModifier(1)
      }
      this.loading = true
    }
    return currentResult
  }

  nextResult (result) {
    super.nextResult(result)

    const { data, loading, error, errors } = result

    const anyErrors = errors && errors.length

    if (error || anyErrors) {
      this.firstRunReject(error)
    }

    if (!loading) {
      this.loadingDone()
    }

    // If `errorPolicy` is set to `all`, an error won't be thrown
    // Instead result will have an `errors` array of GraphQL Errors
    // so we need to reconstruct an error object similar to the normal one
    if (!error && anyErrors) {
      const e = new Error(`GraphQL error: ${errors.map(e => e.message).join(' | ')}`)
      Object.assign(e, {
        graphQLErrors: errors,
        networkError: null,
      })
      // We skip query catchError logic
      // as we only want to dispatch the error
      super.catchError(e)
    }

    if (this.observer.options.errorPolicy === 'none' && (error || anyErrors)) {
      // Don't apply result
      return
    }

    const hasResultCallback = typeof this.options.result === 'function'

    if (data == null) {
      // No result
    } else if (!this.options.manual) {
      if (typeof this.options.update === 'function') {
        this.setData(this.options.update.call(this.vm, data))
      } else if (typeof data[this.key] === 'undefined' && Object.keys(data).length) {
        console.error(`Missing ${this.key} attribute on result`, data)
      } else {
        this.setData(data[this.key])
      }
    } else if (!hasResultCallback) {
      console.error(`${this.key} query must have a 'result' hook in manual mode`)
    }

    if (hasResultCallback) {
      this.options.result.call(this.vm, result, this.key)
    }
  }

  setData (value) {
    const target = this.hasDataField ? this.vm.$data : this.vm.$data.$apolloData.data
    target[this.key] = value
  }

  catchError (error) {
    super.catchError(error)
    this.firstRunReject(error)
    this.loadingDone(error)
    this.nextResult(this.observer.getCurrentResult ? this.observer.getCurrentResult() : this.observer.currentResult())
    // The observable closes the sub if an error occurs
    this.resubscribeToQuery()
  }

  resubscribeToQuery () {
    const lastError = this.observer.getLastError()
    const lastResult = this.observer.getLastResult()
    this.observer.resetLastResults()
    this.startQuerySubscription()
    Object.assign(this.observer, { lastError, lastResult })
  }

  get loadingKey () {
    return this.options.loadingKey || this.vm.$apollo.loadingKey
  }

  watchLoading (...args) {
    return this.callHandlers([
      this.options.watchLoading,
      this.vm.$apollo.watchLoading,
      this.vm.$apollo.provider.watchLoading,
    ], ...args, this)
  }

  applyLoadingModifier (value) {
    const loadingKey = this.loadingKey
    if (loadingKey && typeof this.vm[loadingKey] === 'number') {
      this.vm[loadingKey] += value
    }

    this.watchLoading(value === 1, value)
  }

  loadingDone (error = null) {
    if (this.loading) {
      this.applyLoadingModifier(-1)
    }
    this.loading = false

    if (!error) {
      this.firstRunResolve()
    }
  }

  fetchMore (...args) {
    if (this.observer) {
      this.retrieveCurrentResult(true)
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
      this.retrieveCurrentResult()
      return result
    }
  }

  setVariables (variables, tryFetch) {
    this.options.variables = variables
    if (this.observer) {
      const result = this.observer.setVariables(variables, tryFetch)
      this.retrieveCurrentResult()
      return result
    }
  }

  setOptions (options) {
    Object.assign(this.options, options)
    if (this.observer) {
      const result = this.observer.setOptions(options)
      this.retrieveCurrentResult()
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

  firstRunResolve () {
    if (this._firstRunResolve) {
      this._firstRunResolve()
      this._firstRunResolve = null
    }
  }

  firstRunReject (error) {
    if (this._firstRunReject) {
      this._firstRunReject(error)
      this._firstRunReject = null
    }
  }

  destroy () {
    super.destroy()

    if (this.loading) {
      this.watchLoading(false, -1)
    }
    this.loading = false
  }
}
