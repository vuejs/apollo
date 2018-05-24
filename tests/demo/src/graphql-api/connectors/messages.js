const shortid = require('shortid')
const triggers = require('../triggers')

const messages = []

exports.getAll = (channelId, context) => {
  return messages.filter(m => m.channelId === channelId)
}

exports.add = ({ channelId, content }, context) => {
  const message = {
    id: shortid(),
    userId: context.userId,
    channelId: channelId,
    content: content,
    dateAdded: Date.now(),
  }
  messages.push(message)
  context.pubsub.publish(triggers.MESSAGE_CHANGED, {
    messageChanged: {
      type: 'added',
      message,
    },
  })
  return message
}
