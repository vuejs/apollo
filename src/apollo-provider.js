export class ApolloProvider {
  constructor (options) {
    if (!options) {
      throw new Error('Options argument required')
    }
    this.clients = options.clients || {}
    if (options.defaultClient) {
      this.clients.defaultClient = this.defaultClient = options.defaultClient
    }
    this.defaultOptions = options.defaultOptions
    this.watchLoading = options.watchLoading
    this.errorHandler = options.errorHandler
    this.prefetch = options.prefetch
  }

  provide (key = '$apolloProvider') {
    console.warn(`<ApolloProvider>.provide() is deprecated. Use the 'apolloProvider' option instead with the provider object directly.`)
    return {
      [key]: this,
    }
  }
}
