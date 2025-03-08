import type { ApolloClient } from '@apollo/client/core/index.js'
import serializeJs from 'serialize-javascript'

export interface ApolloClients { [key: string]: ApolloClient<any> }

export interface SerializeStatesOptions {
  useUnsafeSerializer?: boolean
}

export function serializeStates(apolloClients: ApolloClients, options: SerializeStatesOptions & GetStatesOptions = {}) {
  const state = getStates(apolloClients, options)

  return options.useUnsafeSerializer
    ? JSON.stringify(state)
    : serializeJs(state)
}

export interface GetStatesOptions {
  exportNamespace?: string
}

export function getStates(apolloClients: ApolloClients, options: GetStatesOptions = {}) {
  const finalOptions = Object.assign({}, {
    exportNamespace: '',
  }, options)
  const states: Record<string, any> = {}
  for (const key in apolloClients) {
    const client = apolloClients[key]
    const state = client.cache.extract()
    states[`${finalOptions.exportNamespace}${key}`] = state
  }
  return states
}

export interface ExportStatesOptions extends SerializeStatesOptions, GetStatesOptions {
  globalName?: string
  attachTo?: string
}

export function exportStates(apolloClients: ApolloClients, options: ExportStatesOptions = {}) {
  const finalOptions = Object.assign({}, {
    globalName: '__APOLLO_STATE__',
    attachTo: 'window',
    useUnsafeSerializer: false,
  }, options)

  return `${finalOptions.attachTo}.${finalOptions.globalName} = ${serializeStates(apolloClients, options)};`
}
