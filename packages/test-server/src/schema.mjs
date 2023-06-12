import { makeExecutableSchema } from '@graphql-tools/schema'
import { PubSub, withFilter } from 'graphql-subscriptions'
import shortid from 'shortid'
import gql from 'graphql-tag'
import { channels } from './data.mjs'
import { simulateLatency, GraphQLErrorWithCode } from './util.mjs'

const pubsub = new PubSub()

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

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
})
