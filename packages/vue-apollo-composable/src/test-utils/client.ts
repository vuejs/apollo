import type { Client, ClientOptions } from 'graphql-sse'
import { ApolloClient, ApolloLink, HttpLink, InMemoryCache, Observable } from '@apollo/client'
import { Defer20220824Handler } from '@apollo/client/incremental'
import { getMainDefinition } from '@apollo/client/utilities'
import { print } from 'graphql'
import { createClient } from 'graphql-sse'

class SSELink extends ApolloLink {
  private client: Client

  constructor(options: ClientOptions) {
    super()
    this.client = createClient(options)
  }

  public request(operation: ApolloLink.Operation): Observable<ApolloLink.Result> {
    return new Observable((sink) => {
      return this.client.subscribe<ApolloLink.Result>(
        {
          query: print(operation.query),
          variables: operation.variables,
          extensions: operation.extensions,
          ...(operation.operationName && { operationName: operation.operationName }),
        },
        {
          next: data => sink.next(data as ApolloLink.Result),
          complete: sink.complete.bind(sink),
          error: sink.error.bind(sink),
        },
      )
    })
  }

  public dispose() {
    this.client.dispose()
  }
}

export function createApolloClient(port = 4000) {
  const sseLink = new SSELink({ url: `http://localhost:${port}/graphql` })
  const httpLink = new HttpLink({ uri: `http://localhost:${port}/graphql` })

  const splitLink = ApolloLink.split(
    ({ query }) => {
      const definition = getMainDefinition(query)
      return definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
    },
    sseLink,
    httpLink,
  )

  return new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache(),
    incrementalHandler: new Defer20220824Handler(),
  })
}
