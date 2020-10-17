import * as serializeJs from 'serialize-javascript'
import { ApolloClient } from '@apollo/client/core'

export type ApolloClients = { [key: string]: ApolloClient<any> }

export interface SerializeStatesOptions {
  useUnsafeSerializer?: boolean
}

export function serializeStates (apolloClients: ApolloClients, options: SerializeStatesOptions & GetStatesOptions = {}) {
  const state = getStates(apolloClients, options)

  return options.useUnsafeSerializer
    ? JSON.stringify(state)
    : serializeJs(state)
}

export interface GetStatesOptions {
  exportNamespace?: string
}

export function getStates (apolloClients: ApolloClients, options: GetStatesOptions = {}) {
  const finalOptions = Object.assign({}, {
    exportNamespace: '',
  }, options)
  const states = {}
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

export function exportStates (apolloClients: ApolloClients, options: ExportStatesOptions = {}) {
  const finalOptions = Object.assign({}, {
    globalName: '__APOLLO_STATE__',
    attachTo: 'window',
    useUnsafeSerializer: false,
  }, options)

  return `${finalOptions.attachTo}.${finalOptions.globalName} = ${serializeStates(apolloClients, options)};`
}
