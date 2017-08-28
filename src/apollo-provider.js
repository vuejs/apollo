import omit from 'lodash.omit'
import { VUE_APOLLO_QUERY_KEYWORDS } from './consts'
import { getMergedDefinition } from './utils'

export class ApolloProvider {
  constructor (options) {
    if (!options) {
      throw new Error('Options argument required')
    }
    this.clients = options.clients || {}
    this.clients.defaultClient = this.defaultClient = options.defaultClient

    this.prefetchQueries = []
  }

  willPrefetchQuery (queryOptions, client) {
    this.prefetchQueries.push({
      queryOptions,
      client,
    })
  }

  willPrefetch (component) {
    component = getMergedDefinition(component)
    const apolloOptions = component.apollo

    if (!apolloOptions) {
      return
    }

    const componentClient = apolloOptions.$client
    for (let key in apolloOptions) {
      const options = apolloOptions[key]
      if (
        !options.query || (
          (typeof options.ssr === 'undefined' || options.ssr) &&
          (typeof options.prefetch !== 'undefined' && options.prefetch)
        )
      ) {
        this.willPrefetchQuery(options, options.client || componentClient)
      }
    }
  }

  willPrefetchComponents (definitions) {
    for (const def of definitions) {
      this.willPrefetch(def)
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
      this.willPrefetchComponents(components)
    }

    if (finalOptions.includeGlobal) {
      this.willPrefetchComponents(globalPrefetchs)
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
    return new Promise((resolve, reject) => {
      const options = omit(queryOptions, VUE_APOLLO_QUERY_KEYWORDS)
      options.variables = variables
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
      const state = { [client.reduxRootKey || 'apollo']: client.getInitialState() }
      states[`${finalOptions.exportNamespace}${key}`] = state
    }
    return states
  }

  exportStates (options) {
    const finalOptions = Object.assign({}, {
      globalName: '__APOLLO_STATE__',
      attachTo: 'window',
    }, options)
    const states = this.getStates({
      exportNamespace: finalOptions.exportNamespace,
    })
    const js = `${finalOptions.attachTo}.${finalOptions.globalName} = ${JSON.stringify(states)};`
    return js
  }
}

const globalPrefetchs = []

export function willPrefetch (component) {
  globalPrefetchs.push(component)
  return component
}
