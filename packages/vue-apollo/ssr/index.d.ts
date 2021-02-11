import { ApolloProvider } from 'vue-apollo'

interface GetStatesOptions {
  exportNamespace?: string
}

interface ExportStatesOptions {
  globalName?: string
  attachTo?: string
  useUnsafeSerializer?: boolean
}

interface ApolloSsr {
  serializeStates(provider: ApolloProvider, options?: GetStatesOptions): string
  getStates(provider: ApolloProvider, options?: GetStatesOptions): {[key: string]: any}
  exportStates(provider: ApolloProvider, options: ExportStatesOptions): string
}

declare const ssr: ApolloSsr

export default ssr
