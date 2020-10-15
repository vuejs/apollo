import { print } from 'graphql/language/printer'

export function getErrorMessages (error) {
  const messages: string[] = []
  const { graphQLErrors, networkError, operation, stack } = error
  let printedQuery

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
  
  if (networkError) messages.push(`[Network error] ${networkError}`)

  if (stack) messages.push(stack)

  return messages
}

export function logErrorMessages (error, printStack = true) {
  getErrorMessages(error).map(message => {
    const result = /\[([\w ]*)](.*)/.exec(message)
    if (result) {
      const [, tag, msg] = result
      console.log(`%c${tag}`, 'color:white;border-radius:3px;background:#ff4400;font-weight:bold;padding:2px 6px;', msg)
    } else {
      console.log(message)
    }
  })

  if (printStack) {
    let stack = new Error().stack
    const newLineIndex = stack.indexOf('\n')
    stack = stack.substr(stack.indexOf('\n', newLineIndex + 1))
    console.log(`%c${stack}`, 'color:grey;')
  }
}

interface ErrorLocation {
  line: number
  column: number
}

function logOperation (printedQuery: string, locations: ErrorLocation[]) {
  const lines = printedQuery.split('\n')
  const l = lines.length
  const result = lines.slice()
  const lineMap = {}
  for (let i = 0; i < l; i++) {
    lineMap[i] = i
  }
  for (const { line, column } of locations) {
    const index = lineMap[line]
    result.splice(index, 0, '▲'.padStart(column, ' '))
    // Offset remaining lines
    for (let i = index + 1; i < l; i++) {
      lineMap[i]++
    }
  }
  return result.join('\n')
}
