export class ApolloProvider {
  constructor (options) {
    if (!options) {
      throw new Error('Options argument required')
    }
    this.clients = options.clients
    this.defaultClient = options.defaultClient
    this._collecting = false
  }

  collect (options) {
    const finalOptions = Object.assign({}, {
      waitForLoaded: true,
    }, options)
    this._promises = []
    this._collectingOptions = finalOptions
    this._isCollecting = true
    return () => this._ensureReady()
  }

  _waitFor (promise) {
    if (this._isCollecting) {
      this._promises.push(promise)
    }
  }

  _ensureReady () {
    this._isCollecting = false
    return Promise.all(this._promises)
  }
}
