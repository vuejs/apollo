const GraphQLJSON = require('graphql-type-json')

module.exports = {
  JSON: GraphQLJSON,

  Query: {
    hello: (root, { name }) => `Hello ${name || 'World'}!`

  },

  Mutation: {
    myMutation: (root, args, context) => {
      const message = 'My mutation completed!'
      context.pubsub.publish('hey', { mySub: message })
      return message
    }

  },

  Subscription: {
    mySub: {
      subscribe: (parent, args, { pubsub }) => pubsub.asyncIterator('hey')
    }

  }
}
