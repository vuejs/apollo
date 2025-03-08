import { makeExecutableSchema } from '@graphql-tools/schema'
import { PubSub, withFilter } from 'graphql-subscriptions'
import gql from 'graphql-tag'
import shortid from 'shortid'
import { channels } from './data.js'
import { GraphQLErrorWithCode } from './util.js'

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

interface AddMessageInput {
  channelId: string
  text: string
}

interface UpdateMessageInput {
  id: string
  channelId: string
  text: string
}

const resolvers = {
  Query: {
    hello: () => 'Hello world!',
    channels: () => channels,
    channel: (root: any, { id }: { id: string }) => channels.find(c => c.id === id),
    list: () => ['a', 'b', 'c'],
    good: () => 'good',
    bad: async () => {
      throw new Error('An error')
    },
  },

  Mutation: {
    addMessage: (root: any, { input }: { input: AddMessageInput }) => {
      const channel = channels.find(c => c.id === input.channelId)
      if (!channel) {
        throw new GraphQLErrorWithCode(`Channel ${input.channelId} not found`, 'not-found')
      }
      const message = {
        id: shortid(),
        channel,
        text: input.text,
      }
      channel.messages.push(message)
      pubsub.publish('messageAdded', { messageAdded: message })
      return message
    },

    updateMessage: (root: any, { input }: { input: UpdateMessageInput }) => {
      const channel = channels.find(c => c.id === input.channelId)
      if (!channel) {
        throw new GraphQLErrorWithCode(`Channel ${input.channelId} not found`, 'not-found')
      }
      const message = channel.messages.find(m => m.id === input.id)
      if (!message) {
        throw new GraphQLErrorWithCode(`Message ${input.id} not found`, 'not-found')
      }
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
