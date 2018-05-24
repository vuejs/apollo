const GraphQLJSON = require('graphql-type-json')
const { withFilter } = require('graphql-subscriptions')
// Subs
const triggers = require('./triggers')
// Connectors
const channels = require('./connectors/channels')

module.exports = {
  JSON: GraphQLJSON,

  Query: {
    channels: (root, args, context) => channels.getAll(context),
    channel: (root, { id }, context) => channels.getOne(id, context),
  },

  Mutation: {

  },

  Subscription: {
    messageChanged: withFilter(
      (parent, args, { pubsub }) => pubsub.asyncIterator(triggers.MESSAGE_CHANGED),
      (payload, vars) => payload.messageChanged.channelId === vars.channelId
    ),
  },
}
