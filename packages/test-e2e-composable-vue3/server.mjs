import { createServer } from 'node:http'
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { WebSocketServer } from 'ws'
import { useServer } from 'graphql-ws/lib/use/ws'
import { PubSub, withFilter } from 'graphql-subscriptions'
import shortid from 'shortid'
import gql from 'graphql-tag'
import { GraphQLError } from 'graphql'

const shouldSimulateLatency = process.argv.includes('--simulate-latency')

let latency = 500
if (shouldSimulateLatency) {
  const index = process.argv.indexOf('--simulate-latency')
  if (index !== -1 && process.argv.length > index + 1) {
    latency = parseInt(process.argv[index + 1])
  }
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

const typeDefs = gql`
type Channel {
  id: ID!
  label: String!
  messages: [Message!]!
}

type Message {
  id: ID!
  channel: Channel!
  text: String!
}

type Query {
  hello: String!
  channels: [Channel!]!
  channel (id: ID!): Channel
  list: [String!]!
  good: String
  bad: String
}

type Mutation {
  addMessage (input: AddMessageInput!): Message
  updateMessage (input: UpdateMessageInput!): Message
}

input AddMessageInput {
  channelId: ID!
  text: String!
}

input UpdateMessageInput {
  id: ID!
  channelId: ID!
  text: String!
}

type Subscription {
  messageAdded (channelId: ID!): Message!
  messageUpdated (channelId: ID!): Message!
}
`

const pubsub = new PubSub()

let channels = []

function resetDatabase () {
  channels = [
    {
      id: 'general',
      label: 'General',
      messages: [],
    },
    {
      id: 'random',
      label: 'Random',
      messages: [],
    },
  ]
}

resetDatabase()

function simulateLatency () {
  return new Promise(resolve => {
    if (shouldSimulateLatency) {
      setTimeout(resolve, latency)
    } else {
      resolve()
    }
  })
}

const resolvers = {
  Query: {
    hello: () => simulateLatency().then(() => 'Hello world!'),
    channels: () => simulateLatency().then(() => channels),
    channel: (root, { id }) => simulateLatency().then(() => channels.find(c => c.id === id)),
    list: () => simulateLatency().then(() => ['a', 'b', 'c']),
    good: () => simulateLatency().then(() => 'good'),
    bad: async () => {
      await simulateLatency()
      throw new Error('An error')
    },
  },

  Mutation: {
    addMessage: (root, { input }) => {
      const channel = channels.find(c => c.id === input.channelId)
      if (!channel) {
        throw new GraphQLErrorWithCode(`Channel ${input.channelId} not found`, 'not-found')
      }
      const message = {
        id: shortid(),
        channel: channel,
        text: input.text,
      }
      channel.messages.push(message)
      pubsub.publish('messageAdded', { messageAdded: message })
      return message
    },

    updateMessage: (root, { input }) => {
      const channel = channels.find(c => c.id === input.channelId)
      if (!channel) {
        throw new GraphQLErrorWithCode(`Channel ${input.channelId} not found`, 'not-found')
      }
      const message = channel.messages.find(m => m.id === input.id)
      Object.assign(message, {
        text: input.text,
      })
      pubsub.publish('messageUpdated', { messageUpdated: message })
      return message
    },
  },

  Subscription: {
    messageAdded: {
      subscribe: withFilter(
        () => pubsub.asyncIterator('messageAdded'),
        (payload, variables) => payload.messageAdded.channel.id === variables.channelId,
      ),
    },

    messageUpdated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator('messageUpdated'),
        (payload, variables) => payload.messageUpdated.channel.id === variables.channelId,
      ),
    },
  },
}

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
})

const app = express()

app.use(cors('*'))

app.use(bodyParser.json())

app.get('/_reset', (req, res) => {
  resetDatabase()
  res.status(200).end()
})

const server = new ApolloServer({
  schema,
  context: () => new Promise(resolve => {
    setTimeout(() => resolve({}), 50)
  }),
  plugins: [
    // Proper shutdown for the WebSocket server.
    {
      async serverWillStart () {
        return {
          async drainServer () {
            await serverCleanup.dispose()
          },
        }
      },
    },
  ],
  csrfPrevention: false,
})

await server.start()

app.use('/graphql', expressMiddleware(server))

const httpServer = createServer(app)

// Websocket

const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql',
})

const serverCleanup = useServer({
  schema,
}, wsServer)

httpServer.listen({
  port: 4042,
}, () => {
  console.log('🚀  Server ready at http://localhost:4042')
})
