const shortid = require('shortid')
const triggers = require('../triggers')

const messages = []

function publishChange ({ type, message }, context) {
  context.pubsub.publish(triggers.MESSAGE_CHANGED, {
    messageChanged: {
      type,
      message,
    },
  })
}

exports.getAll = (channelId, context) => {
  return messages.filter(m => m.channelId === channelId)
}

exports.getOne = (id, context) => {
  return messages.find(m => m.id === id)
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
  publishChange({
    type: 'added',
    message,
  }, context)
  return message
}

exports.update = ({ id, content }, context) => {
  const message = exports.getOne(id, context)
  if (!message) throw new Error('Message not found')
  Object.assign(message, {
    content,
    dateUpdated: Date.now(),
  })
  publishChange({
    type: 'updated',
    message,
  }, context)
  return message
}

exports.remove = (id, context) => {
  const index = messages.findIndex(m => m.id === id)
  if (index === -1) throw new Error('Message not found')
  const message = messages[index]
  messages.splice(index, 1)
  publishChange({
    type: 'removed',
    message,
  })
  return message
}
