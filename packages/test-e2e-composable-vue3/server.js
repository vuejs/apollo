const { gql, ApolloServer, ApolloError, PubSub, withFilter } = require('apollo-server')
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
  channels: [Channel!]!
  channel (id: ID!): Channel
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

const channels = [
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

const resolvers = {
  Query: {
    channels: () => channels,
    channel: (root, { id }) => channels.find(c => c.id === id),
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

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server.listen({
  port: 4042,
}).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`)
})
