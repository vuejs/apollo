/* eslint-disable no-console */

import type { IncomingMessage, Server, ServerResponse } from 'node:http'
import { createServer } from 'node:http'
import process from 'node:process'
import { setTimeout } from 'node:timers/promises'
import { useDeferStream } from '@graphql-yoga/plugin-defer-stream'
import { createPubSub, createSchema, createYoga } from 'graphql-yoga'

// #region PubSub for Subscriptions
const pubSub = createPubSub<{
  'message:created': [{ messageCreated: Message }]
  'notification': [{ notification: Notification }]
  'counter': [{ counter: number }]
}>()
// #endregion

// #region Types
interface User {
  id: string
  name: string
  email: string
}

interface Todo {
  id: string
  text: string
  completed: boolean
  userId: string
}

interface Message {
  id: string
  text: string
  author: string
  channelId: string
  createdAt: string
}

interface Notification {
  id: string
  type: 'info' | 'warning' | 'error'
  message: string
}
// #endregion

// #region In-Memory Data Store
let userIdCounter = 3
let todoIdCounter = 4
let messageIdCounter = 1
let notificationIdCounter = 1

const users: User[] = [
  { id: '1', name: 'Alice', email: 'alice@example.com' },
  { id: '2', name: 'Bob', email: 'bob@example.com' },
  { id: '3', name: 'Charlie', email: 'charlie@example.com' },
]

const todos: Todo[] = [
  { id: '1', text: 'Learn GraphQL', completed: true, userId: '1' },
  { id: '2', text: 'Build Vue app', completed: false, userId: '1' },
  { id: '3', text: 'Write tests', completed: false, userId: '2' },
  { id: '4', text: 'Deploy to production', completed: false, userId: '2' },
]
// #endregion

// #region Schema
export const schema = createSchema({
  typeDefs: /* GraphQL */ `
    type Query {
      # Basic queries
      hello: String!
      echo(message: String!): String!

      # Delayed queries (for loading state / @defer testing)
      slow(delay: Int = 2000): String!

      # Error testing
      canThrowError(shouldError: Boolean!): String!
      nullableError(shouldError: Boolean!): String

      # User queries
      user(id: ID!): User
      users(limit: Int, offset: Int): [User!]!
      searchUsers(term: String!): [User!]!

      # Todo queries
      todo(id: ID!): Todo
      todos(userId: ID, completed: Boolean): [Todo!]!

      # Pagination testing (fetchMore)
      paginatedTodos(limit: Int = 10, offset: Int = 0): TodoConnection!

      # @stream testing
      alphabet: [String!]!
      numbers(count: Int = 5): [Int!]!
    }

    type Mutation {
      # User mutations
      createUser(input: CreateUserInput!): User!
      updateUser(id: ID!, input: UpdateUserInput!): User
      deleteUser(id: ID!): Boolean!

      # Todo mutations
      createTodo(input: CreateTodoInput!): Todo!
      updateTodo(id: ID!, input: UpdateTodoInput!): Todo
      deleteTodo(id: ID!): Boolean!
      toggleTodo(id: ID!): Todo

      # Slow mutation (for loading state testing)
      slowMutation(delay: Int = 1000): String!

      # Error mutation
      failingMutation(message: String = "Mutation failed"): String!

      # Subscription triggers
      sendMessage(channelId: ID!, text: String!, author: String!): Message!
      sendNotification(type: NotificationType!, message: String!): Notification!
      incrementCounter: Int!

      # Test utilities
      reset: Boolean!
    }

    type Subscription {
      # Basic subscription
      counter: Int!

      # Message subscription with filter
      messageCreated(channelId: ID!): Message!

      # Notification subscription
      notification: Notification!

      # Countdown (finite subscription that completes)
      countdown(from: Int!): Int!
    }

    # Types
    type User {
      id: ID!
      name: String!
      email: String!
      todos: [Todo!]!
    }

    type Todo {
      id: ID!
      text: String!
      completed: Boolean!
      user: User!
    }

    type Message {
      id: ID!
      text: String!
      author: String!
      channelId: ID!
      createdAt: String!
    }

    type Notification {
      id: ID!
      type: NotificationType!
      message: String!
    }

    type TodoConnection {
      items: [Todo!]!
      totalCount: Int!
      hasMore: Boolean!
    }

    # Input types
    input CreateUserInput {
      name: String!
      email: String!
    }

    input UpdateUserInput {
      name: String
      email: String
    }

    input CreateTodoInput {
      text: String!
      userId: ID!
    }

    input UpdateTodoInput {
      text: String
      completed: Boolean
    }

    # Enums
    enum NotificationType {
      info
      warning
      error
    }
  `,
  resolvers: {
    Query: {
      // Basic queries
      hello: () => 'world',
      echo: (_parent, args: { message: string }) => args.message,

      // Delayed query (for loading state / @defer testing)
      slow: async (_parent, args: { delay: number }) => {
        await setTimeout(args.delay)
        return 'done'
      },

      // Error testing
      canThrowError: (_parent, args: { shouldError: boolean }) => {
        if (args.shouldError) {
          throw new Error('An error occurred as requested.')
        }
        return 'No error'
      },
      nullableError: (_parent, args: { shouldError: boolean }) => {
        if (args.shouldError) {
          throw new Error('A nullable error occurred as requested.')
        }
        return 'No error'
      },

      // User queries
      user: (_parent, args: { id: string }) => users.find(u => u.id === args.id),
      users: (_parent, args: { limit?: number, offset?: number }) => {
        const start = args.offset ?? 0
        const end = args.limit ? start + args.limit : undefined
        return users.slice(start, end)
      },
      searchUsers: (_parent, args: { term: string }) =>
        users.filter(u =>
          u.name.toLowerCase().includes(args.term.toLowerCase())
          || u.email.toLowerCase().includes(args.term.toLowerCase()),
        ),

      // Todo queries
      todo: (_parent, args: { id: string }) => todos.find(t => t.id === args.id),
      todos: (_parent, args: { userId?: string, completed?: boolean }) => {
        let result = todos
        if (args.userId) {
          result = result.filter(t => t.userId === args.userId)
        }
        if (args.completed !== undefined) {
          result = result.filter(t => t.completed === args.completed)
        }
        return result
      },

      // Pagination (for fetchMore testing)
      paginatedTodos: (_parent, args: { limit: number, offset: number }) => {
        const items = todos.slice(args.offset, args.offset + args.limit)
        return {
          items,
          totalCount: todos.length,
          hasMore: args.offset + args.limit < todos.length,
        }
      },

      // @stream testing
      async* alphabet() {
        for (const char of ['a', 'b', 'c', 'd', 'e', 'f', 'g']) {
          yield char
          await setTimeout(100)
        }
      },
      async* numbers(_parent, args: { count: number }) {
        for (let i = 1; i <= args.count; i++) {
          yield i
          await setTimeout(100)
        }
      },
    },

    Mutation: {
      // User mutations
      createUser: (_parent, args: { input: { name: string, email: string } }) => {
        const newUser: User = {
          id: String(++userIdCounter),
          name: args.input.name,
          email: args.input.email,
        }
        users.push(newUser)
        return newUser
      },
      updateUser: (_parent, args: { id: string, input: { name?: string, email?: string } }) => {
        const user = users.find(u => u.id === args.id)
        if (!user)
          return null
        if (args.input.name)
          user.name = args.input.name
        if (args.input.email)
          user.email = args.input.email
        return user
      },
      deleteUser: (_parent, args: { id: string }) => {
        const index = users.findIndex(u => u.id === args.id)
        if (index === -1)
          return false
        users.splice(index, 1)
        return true
      },

      // Todo mutations
      createTodo: (_parent, args: { input: { text: string, userId: string } }) => {
        const newTodo: Todo = {
          id: String(++todoIdCounter),
          text: args.input.text,
          completed: false,
          userId: args.input.userId,
        }
        todos.push(newTodo)
        return newTodo
      },
      updateTodo: (_parent, args: { id: string, input: { text?: string, completed?: boolean } }) => {
        const todo = todos.find(t => t.id === args.id)
        if (!todo)
          return null
        if (args.input.text !== undefined)
          todo.text = args.input.text
        if (args.input.completed !== undefined)
          todo.completed = args.input.completed
        return todo
      },
      deleteTodo: (_parent, args: { id: string }) => {
        const index = todos.findIndex(t => t.id === args.id)
        if (index === -1)
          return false
        todos.splice(index, 1)
        return true
      },
      toggleTodo: (_parent, args: { id: string }) => {
        const todo = todos.find(t => t.id === args.id)
        if (!todo)
          return null
        todo.completed = !todo.completed
        return todo
      },

      // Slow mutation (for loading state testing)
      slowMutation: async (_parent, args: { delay: number }) => {
        await setTimeout(args.delay)
        return 'Mutation completed'
      },

      // Failing mutation (for error handling testing)
      failingMutation: (_parent, args: { message: string }) => {
        throw new Error(args.message)
      },

      // Subscription triggers
      sendMessage: (_parent, args: { channelId: string, text: string, author: string }) => {
        const message: Message = {
          id: String(++messageIdCounter),
          text: args.text,
          author: args.author,
          channelId: args.channelId,
          createdAt: new Date().toISOString(),
        }
        pubSub.publish('message:created', { messageCreated: message })
        return message
      },
      sendNotification: (_parent, args: { type: 'info' | 'warning' | 'error', message: string }) => {
        const notification: Notification = {
          id: String(++notificationIdCounter),
          type: args.type,
          message: args.message,
        }
        pubSub.publish('notification', { notification })
        return notification
      },
      incrementCounter: () => {
        const value = Math.floor(Math.random() * 100)
        pubSub.publish('counter', { counter: value })
        return value
      },

      // Test utilities
      reset: () => {
        resetData()
        return true
      },
    },

    Subscription: {
      counter: {
        subscribe: () => pubSub.subscribe('counter'),
      },
      messageCreated: {
        subscribe: (_parent, args: { channelId: string }) => {
          // Filter messages by channelId using async generator
          const iterator = pubSub.subscribe('message:created')
          return {
            async* [Symbol.asyncIterator]() {
              for await (const payload of iterator) {
                if (payload.messageCreated.channelId === args.channelId) {
                  yield payload
                }
              }
            },
          }
        },
      },
      notification: {
        subscribe: () => pubSub.subscribe('notification'),
      },
      countdown: {
        async* subscribe(_parent, args: { from: number }) {
          for (let i = args.from; i >= 0; i--) {
            yield { countdown: i }
            if (i > 0)
              await setTimeout(1000)
          }
        },
      },
    },

    // Field resolvers
    User: {
      todos: (parent: User) => todos.filter(t => t.userId === parent.id),
    },
    Todo: {
      user: (parent: Todo) => users.find(u => u.id === parent.userId),
    },
  },
})
// #endregion

// #region Server
const yoga = createYoga({
  schema,
  plugins: [useDeferStream()],
  graphiql: {
    subscriptionsProtocol: 'SSE',
  },
})

let server: Server<typeof IncomingMessage, typeof ServerResponse>

export function startServer(port = 4000) {
  server = createServer(yoga)

  server.listen(port, () => {
    console.info(`GraphQL Server is running on http://localhost:${port}/graphql`)
  })

  return server
}

export function stopServer(targetServer?: Server<typeof IncomingMessage, typeof ServerResponse>) {
  const serverToStop = targetServer ?? server
  return new Promise<void>((resolve) => {
    if (serverToStop) {
      serverToStop.close(() => {
        console.info('GraphQL Server stopped.')
        resolve()
      })
    }
    else {
      resolve()
    }
  })
}

/** Reset data between tests */
export function resetData() {
  userIdCounter = 3
  todoIdCounter = 4
  messageIdCounter = 0
  notificationIdCounter = 0

  users.length = 0
  users.push(
    { id: '1', name: 'Alice', email: 'alice@example.com' },
    { id: '2', name: 'Bob', email: 'bob@example.com' },
    { id: '3', name: 'Charlie', email: 'charlie@example.com' },
  )

  todos.length = 0
  todos.push(
    { id: '1', text: 'Learn GraphQL', completed: true, userId: '1' },
    { id: '2', text: 'Build Vue app', completed: false, userId: '1' },
    { id: '3', text: 'Write tests', completed: false, userId: '2' },
    { id: '4', text: 'Deploy to production', completed: false, userId: '2' },
  )
}

// Export pubSub for testing subscriptions directly
export { pubSub }

if (process.argv.includes('--start-server')) {
  startServer()
}
// #endregion
