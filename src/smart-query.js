import SmartApollo from './smart-apollo'
import { VUE_APOLLO_QUERY_KEYWORDS } from '../lib/consts'

export default class SmartQuery extends SmartApollo {
  type = 'query'
  vueApolloSpecialKeys = VUE_APOLLO_QUERY_KEYWORDS
  _loading = false

  constructor (vm, key, options, autostart = true) {
    // Simple query
    if (!options.query) {
      const query = options
      options = {
        query,
      }
    }

    // Add reactive data related to the query
    if (vm.$data.$apolloData && !vm.$data.$apolloData.queries[key]) {
      vm.$set(vm.$data.$apolloData.queries, key, {
        loading: false,
      })
    }

    super(vm, key, options, autostart)

    if (!options.manual) {
      this.hasDataField = this.vm.$data.hasOwnProperty(key)
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
    }

    this.startQuerySubscription()

    if (this.options.fetchPolicy !== 'no-cache') {
      const currentResult = this.maySetLoading()

      if (!currentResult.loading) {
        this.nextResult(currentResult)
      }
    }

    super.executeApollo(variables)
  }

  startQuerySubscription () {
    if (this.sub && !this.sub.closed) return

    // Create subscription
    this.sub = this.observer.subscribe({
      next: this.nextResult.bind(this),
      error: this.catchError.bind(this),
    })
  }

  maySetLoading (force = false) {
    const currentResult = this.observer.currentResult()
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

    const { data, loading } = result

    if (!loading) {
      this.loadingDone()
    }

    const hasResultCallback = typeof this.options.result === 'function'

    if (typeof data === 'undefined') {
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
      this.options.result.call(this.vm, result)
    }
  }

  setData (value) {
    this.vm.$set(this.hasDataField ? this.vm.$data : this.vm.$data.$apolloData.data, this.key, value)
  }

  catchError (error) {
    super.catchError(error)
    this.loadingDone()
    this.nextResult(this.observer.currentResult())
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

  destroy () {
    super.destroy()

    if (this.loading) {
      this.watchLoading(false, -1)
    }
    this.loading = false
  }
}
