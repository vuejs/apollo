export class ApolloProvider {
  constructor (options) {
    if (!options) {
      throw new Error('Options argument required')
    }
    this.clients = options.clients
    this.defaultClient = options.defaultClient
    this._collecting = false
  }

  collect () {
    this._promises = []
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
