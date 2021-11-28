const express = require('express')
const cors = require('cors')
const { gql, ApolloServer, ApolloError, PubSub, withFilter } = require('apollo-server-express')
const shortid = require('shortid')

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

const resolvers = {
  Query: {
    hello: () => 'Hello world!',
    channels: () => channels,
    channel: (root, { id }) => channels.find(c => c.id === id),
    list: () => ['a', 'b', 'c'],
    good: () => 'good',
    bad: () => {
      throw new Error('An error')
    },
  },

  Mutation: {
    addMessage: (root, { input }) => {
      const channel = channels.find(c => c.id === input.channelId)
      if (!channel) {
        throw new ApolloError(`Channel ${input.channelId} not found`, 'not-found')
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
        throw new ApolloError(`Channel ${input.channelId} not found`, 'not-found')
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

const app = express()

app.use(cors('*'))

app.get('/_reset', (req, res) => {
  resetDatabase()
  res.status(200).end()
})

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: () => new Promise(resolve => {
    setTimeout(() => resolve({}), 50)
  }),
})

server.applyMiddleware({ app })

app.listen({
  port: 4042,
}, () => {
  console.log('🚀  Server ready at http://localhost:4042')
})
