import { createServer } from 'node:http'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import bodyParser from 'body-parser'
import cors from 'cors'
import express from 'express'
import { useServer } from 'graphql-ws/lib/use/ws'
import { WebSocketServer } from 'ws'
import { resetDatabase, seedDatabase } from './data.js'
import { schema } from './schema.js'
import { simulateLatency } from './util.js'

const app = express()

app.use(cors({
  origin: '*',
}))

app.use(bodyParser.json())

app.get('/_reset', (req, res) => {
  resetDatabase()
  res.status(200).end()
})

app.get('/_seed', (req, res) => {
  seedDatabase()
  res.status(200).end()
})

const server = new ApolloServer({
  schema,
  plugins: [
    // Proper shutdown for the WebSocket server.
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose()
          },
        }
      },
    },
  ],
  csrfPrevention: false,
})

await server.start()

app.use('/graphql', expressMiddleware(server, {
  context: async () => {
    await simulateLatency()
    return {}
  },
}))

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
