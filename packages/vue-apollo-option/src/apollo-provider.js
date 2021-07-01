import { installMixin } from './mixin'
import { omit } from '../lib/utils'

const keywords = [
  '$subscribe',
]

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

  install (app) {
    // Options merging
    const merge = app.config.optionMergeStrategies.methods
    app.config.optionMergeStrategies.apollo = function (toVal, fromVal, vm) {
      if (!toVal) return fromVal
      if (!fromVal) return toVal

      const toData = Object.assign({}, omit(toVal, keywords), toVal.data)
      const fromData = Object.assign({}, omit(fromVal, keywords), fromVal.data)

      const map = {}
      for (let i = 0; i < keywords.length; i++) {
        const key = keywords[i]
        map[key] = merge(toVal[key], fromVal[key])
      }

      return Object.assign(map, merge(toData, fromData))
    }

    app.config.globalProperties.$apolloProvider = this

    installMixin(app, this)
  }
}
