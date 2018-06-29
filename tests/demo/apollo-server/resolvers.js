const GraphQLJSON = require('graphql-type-json')
const { withFilter } = require('graphql-subscriptions')
// Subs
const triggers = require('./triggers')
// Connectors
const channels = require('./connectors/channels')
const messages = require('./connectors/messages')
const users = require('./connectors/users')

module.exports = {
  JSON: GraphQLJSON,

  Channel: {
    messages: (channel, args, context) => messages.getAll(channel.id, context),
  },

  Message: {
    user: (message, args, context) => users.getOne(message.userId, context),
  },

  Query: {
    userCurrent: (root, args, context) => users.current(context),
    channels: (root, args, context) => channels.getAll(context),
    channel: (root, { id }, context) => channels.getOne(id, context),
  },

  Mutation: {
    userRegister: (root, { input }, context) => users.register(input, context),
    userLogin: (root, args, context) => users.login(args, context),
    userLogout: (root, args, context) => users.logout(context),
    messageAdd: (root, { input }, context) => messages.add(input, context),
    messageUpdate: (root, { input }, context) => messages.update(input, context),
    messageRemove: (root, { id }, context) => messages.remove(id, context),
  },

  Subscription: {
    messageChanged: {
      subscribe: withFilter(
        (parent, args, { pubsub }) => pubsub.asyncIterator(triggers.MESSAGE_CHANGED),
        (payload, vars) => payload.messageChanged.message.channelId === vars.channelId
      ),
    },
  },
}
