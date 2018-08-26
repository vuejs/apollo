import { VUE_APOLLO_QUERY_KEYWORDS } from './consts'
import { getMergedDefinition, omit } from './utils'

export class ApolloProvider {
  constructor (options) {
    if (!options) {
      throw new Error('Options argument required')
    }
    this.clients = options.clients || {}
    this.clients.defaultClient = this.defaultClient = options.defaultClient
    this.defaultOptions = options.defaultOptions
    this.watchLoading = options.watchLoading
    this.errorHandler = options.errorHandler

    this.prefetchQueries = []
  }

  provide (key = '$apolloProvider') {
    console.warn(`<ApolloProvider>.provide() is deprecated. Use the 'apolloProvider' option instead with the provider object directly.`)
    return {
      [key]: this,
    }
  }

  addQueryToPrefetch (queryOptions, client) {
    this.prefetchQueries.push({
      queryOptions,
      client,
    })
  }

  prefetchComponent (component, context) {
    component = getMergedDefinition(component)
    const apolloOptions = component.apollo

    if (!apolloOptions) {
      return
    }

    const componentClient = apolloOptions.$client
    for (let key in apolloOptions) {
      const options = apolloOptions[key]
      if (
        key.charAt(0) !== '$' && (
          !options.query || (
            (typeof options.ssr === 'undefined' || options.ssr) &&
            (typeof options.prefetch !== 'undefined' && options.prefetch)
          )
        )
      ) {
        this.addQueryToPrefetch(options, options.client || componentClient)
      }
    }
  }

  prefetchComponents (definitions) {
    for (const def of definitions) {
      this.prefetchComponent(def)
    }
  }

  prefetchAll (context, components, options) {
    // Optional components argument
    if (!options && components && !Array.isArray(components)) {
      options = components
      components = undefined
    }

    const finalOptions = Object.assign({}, {
      includeGlobal: true,
    }, options)

    if (components) {
      this.prefetchComponents(components)
    }

    if (finalOptions.includeGlobal) {
      this.prefetchComponents(globalPrefetchs.filter(
        ({ component, contextCallback }) => {
          let result = true
          if (typeof contextCallback === 'function') {
            result = !!contextCallback(context)
          }
          return result
        }
      ).map(
        ({ component }) => component
      ), context)
    }

    return Promise.all(this.prefetchQueries.map(
      o => this.prefetchQuery(o.queryOptions, context, o.client)
    ))
  }

  prefetchQuery (queryOptions, context, client) {
    let variables

    // Client
    if (!client) {
      client = this.defaultClient
    } else if (typeof client === 'string') {
      client = this.clients[client]
      if (!client) {
        throw new Error(`[vue-apollo] Missing client '${client}' in 'apolloProvider'`)
      }
    }

    // Simple query
    if (!queryOptions.query) {
      queryOptions = {
        query: queryOptions,
      }
    } else {
      const prefetch = queryOptions.prefetch
      const prefetchType = typeof prefetch

      // Resolve variables
      if (prefetchType !== 'undefined') {
        let result
        if (prefetchType === 'function') {
          result = prefetch(context)
        } else {
          result = prefetch
        }

        if (!result) {
          return Promise.resolve()
        } else if (prefetchType === 'boolean') {
          const optVariables = queryOptions.variables
          if (typeof optVariables !== 'undefined') {
            // Reuse `variables` option with `prefetch: true`
            if (typeof optVariables === 'function') {
              variables = optVariables.call(context)
            } else {
              variables = optVariables
            }
          } else {
            variables = undefined
          }
        } else {
          variables = result
        }
      }
    }

    // Query
    if (typeof queryOptions.query === 'function') {
      queryOptions.query = queryOptions.query(context)
    }
    return new Promise((resolve, reject) => {
      const options = omit(queryOptions, [
        ...VUE_APOLLO_QUERY_KEYWORDS,
        'fetchPolicy',
      ])
      options.variables = variables
      options.fetchPolicy = 'network-only'
      client.query(options).then(resolve, reject)
    })
  }

  getStates (options) {
    const finalOptions = Object.assign({}, {
      exportNamespace: '',
    }, options)
    const states = {}
    for (const key in this.clients) {
      const client = this.clients[key]
      const state = client.cache.extract()
      states[`${finalOptions.exportNamespace}${key}`] = state
    }
    return states
  }

  exportStates (options) {
    const finalOptions = Object.assign({}, {
      globalName: '__APOLLO_STATE__',
      attachTo: 'window',
    }, options)
    const states = this.getStates(finalOptions)
    const js = `${finalOptions.attachTo}.${finalOptions.globalName} = ${JSON.stringify(states)};`
    return js
  }
}

const globalPrefetchs = []

export function willPrefetch (component, contextCallback = null) {
  globalPrefetchs.push({ component, contextCallback })
  return component
}

// Global access for libraries
if (typeof window !== 'undefined') {
  window.vueApolloWillPrefetch = willPrefetch
} else if (typeof global !== 'undefined') {
  global.vueApolloWillPrefetch = willPrefetch
}
