import { GraphQLError } from 'graphql'

const shouldSimulateLatency = process.argv.includes('--simulate-latency')

let latency = 500
if (shouldSimulateLatency) {
  const index = process.argv.indexOf('--simulate-latency')
  if (index !== -1 && process.argv.length > index + 1) {
    latency = parseInt(process.argv[index + 1])
  }
}

export function simulateLatency () {
  return new Promise(resolve => {
    if (shouldSimulateLatency) {
      setTimeout(resolve, latency)
    } else {
      resolve()
    }
  })
}

export class GraphQLErrorWithCode extends GraphQLError {
  constructor (message, code, extensions) {
    super(message, {
      extensions: {
        code,
        ...extensions,
      },
    })
  }
}
