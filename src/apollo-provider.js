export class ApolloProvider {
  constructor (options) {
    if (!options) {
      throw new Error('Options argument required')
    }
    this.clients = options.clients || {}
    this.clients.defaultClient = this.defaultClient = options.defaultClient
    this._collecting = false
  }

  collect (options) {
    const finalOptions = Object.assign({}, {
      waitForLoaded: true,
    }, options)
    this._ready = false
    this._promises = []
    this._collectingOptions = finalOptions
    this._isCollecting = true
    this._ensureReadyPromise = null
    return this.ensureReady
  }

  ensureReady () {
    if (this._ready) {
      return Promise.resolve()
    } else {
      if (!this._ensureReadyPromise) {
        this._ensureReadyPromise = this._ensureReady()
      }
      return this._ensureReadyPromise
    }
  }

  _waitFor (promise) {
    if (this._isCollecting) {
      this._promises.push(promise)
    }
  }

  _ensureReady () {
    this._isCollecting = false
    return Promise.all(this._promises).then((result) => {
      this._ready = true
      return result
    })
  }
}
