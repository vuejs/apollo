import SmartApollo from './smart-apollo'

const MAX_RETRIES = 5
const DELAY_MS = 500

export default class SmartSubscription extends SmartApollo {
  type = 'subscription'
  vueApolloSpecialKeys = [
    'variables',
    'result',
    'error',
    'throttle',
    'debounce',
    'linkedQuery',
  ]

  constructor (vm, key, options, autostart = true) {
    super(vm, key, options)

    this.attempts = 0

    if (autostart) {
      this.autostart()
    }
  }

  generateApolloOptions (variables) {
    const apolloOptions = super.generateApolloOptions(variables)

    apolloOptions.onError = this.catchError.bind(this)

    return apolloOptions
  }

  executeApollo (variables) {
    if (this._destroyed) return

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

    if (typeof apolloOptions.updateQuery === 'function') {
      apolloOptions.updateQuery = apolloOptions.updateQuery.bind(this.vm)
    }

    if (this.options.linkedQuery) {
      if (typeof this.options.result === 'function') {
        const rcb = this.options.result.bind(this.vm)
        const ucb = apolloOptions.updateQuery && apolloOptions.updateQuery.bind(this.vm)
        apolloOptions.updateQuery = (...args) => {
          rcb(...args)
          return ucb && ucb(...args)
        }
      }
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
    super.nextResult(data)

    this.attempts = 0

    if (typeof this.options.result === 'function') {
      this.options.result.call(this.vm, data, this.key)
    }
  }

  catchError (error) {
    super.catchError(error)
    // Restart the subscription
    if (this.skip || this.attempts >= MAX_RETRIES) {
      return
    }

    this.stop()

    // Restart the subscription with exponential backoff
    this.retryTimeout = setTimeout(this.start.bind(this), Math.pow(2, this.attempts) * DELAY_MS)
    this.attempts++
  }

  stop () {
    super.stop()
    clearTimeout(this.retryTimeout)
  }
}
