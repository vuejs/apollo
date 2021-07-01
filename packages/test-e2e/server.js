const http = require('http')
const express = require('express')
const cors = require('cors')
const { ApolloServer, PubSub } = require('apollo-server-express')

const typeDefs = require('./apollo-server/type-defs')
const resolvers = require('./apollo-server/resolvers')
const schemaDirectives = require('./apollo-server/directives')
const context = require('./apollo-server/context')

const pubsub = new PubSub()

const app = express()

app.use(cors('*'))

const server = new ApolloServer({
  typeDefs,
  resolvers,
  schemaDirectives,
  context: async ({ req, connection }) => {
    let contextData
    try {
      if (connection) {
        contextData = await context({ connection })
      } else {
        contextData = await context({ req })
      }
    } catch (e) {
      console.error(e)
      throw e
    }
    contextData = Object.assign({}, contextData, { pubsub })
    return contextData
  },
  subscriptions: {
    onConnect: async (connection, websocket) => {
      let contextData = {}
      try {
        contextData = await context({
          connection,
          websocket,
        })
        contextData = Object.assign({}, contextData, { pubsub })
      } catch (e) {
        console.error(e)
        throw e
      }
      return contextData
    },
  },
  formatError: (error) => {
    if (error.extensions.code !== 'unauthorized') {
      console.error(error.extensions?.exception?.stacktrace.join('\n') ?? error)
    }
    return error
  },
  playground: true,
  introspection: true,
})

server.applyMiddleware({ app })

const httpServer = http.createServer(app)
server.installSubscriptionHandlers(httpServer)

httpServer.listen({
  port: 4042,
}, () => {
  console.log('🚀  Server ready at http://localhost:4042')
})
