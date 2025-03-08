/* eslint-disable no-console */

import type { ApolloError } from '@apollo/client/core/index.js'
import type { ErrorResponse } from '@apollo/client/link/error/index.js'
import { print } from 'graphql/language/printer'

export function getErrorMessages(error: ErrorResponse | ApolloError) {
  const messages: string[] = []
  const { graphQLErrors, networkError } = error
  const operation = 'operation' in error ? error.operation : undefined
  const stack = 'stack' in error ? error.stack : undefined
  let printedQuery: string

  if (operation) {
    printedQuery = print(operation.query)
  }

  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations }) => {
      messages.push(`[GraphQL error] ${message}`)
      if (operation) {
        messages.push(logOperation(printedQuery, locations))
        if (Object.keys(operation.variables).length) {
          messages.push(`with variables: ${JSON.stringify(operation.variables, null, 2)}`)
        }
      }
    })
  }

  if (networkError)
    messages.push(`[Network error] ${networkError}`)

  if (stack)
    messages.push(stack)

  return messages
}

export function logErrorMessages(error: ApolloError | ErrorResponse, printStack = true) {
  getErrorMessages(error).forEach((message) => {
    const result = /\[([\w ]*)\](.*)/.exec(message)
    if (result) {
      const [, tag, msg] = result
      console.log(`%c${tag}`, 'color:white;border-radius:3px;background:#ff4400;font-weight:bold;padding:2px 6px;', msg)
    }
    else {
      console.log(message)
    }
  })

  if (printStack) {
    // eslint-disable-next-line unicorn/error-message
    let stack = new Error().stack
    if (stack == null)
      return

    const newLineIndex = stack.indexOf('\n')
    stack = stack.slice(stack.indexOf('\n', newLineIndex + 1))
    console.log(`%c${stack}`, 'color:grey;')
  }
}

interface ErrorLocation {
  line: number
  column: number
}

function logOperation(printedQuery: string, locations: readonly ErrorLocation[] | undefined) {
  const lines = printedQuery.split('\n')
  const l = lines.length
  const result = lines.slice()
  const lineMap: Record<number, number> = {}
  for (let i = 0; i < l; i++) {
    lineMap[i] = i
  }

  if (locations) {
    for (const { line, column } of locations) {
      const index = lineMap[line]
      result.splice(index, 0, '▲'.padStart(column, ' '))
      // Offset remaining lines
      for (let i = index + 1; i < l; i++) {
        lineMap[i]++
      }
    }
  }

  return result.join('\n')
}
