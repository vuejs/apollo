import { createServer } from 'node:http'
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import { WebSocketServer } from 'ws'
import { useServer } from 'graphql-ws/lib/use/ws'
import { schema } from './schema.mjs'
import { resetDatabase } from './data.mjs'

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
