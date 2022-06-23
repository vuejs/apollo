const shortid = require('shortid')
const triggers = require('../triggers')

function createDefaultMessages () {
  return [
    {
      id: '__bot:1',
      userId: '__bot',
      channelId: 'general',
      content: 'Welcome to the chat!',
      dateAdded: Date.now(),
    },
  ]
}

let messages = createDefaultMessages()

function publishChange ({ type, message }, context) {
  context.pubsub.publish(triggers.MESSAGE_CHANGED, {
    messageChanged: {
      type,
      message,
    },
  })
}

exports.getAll = (channelId, context) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(messages.filter(m => m.channelId === channelId))
    }, 100)
  })
}

exports.getOne = (id, context) => {
  return messages.find(m => m.id === id)
}

exports.add = ({ channelId, content }, context) => {
  return new Promise((resolve) => {
    setTimeout(() => {
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
      resolve(message)
    }, 100)
  })
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

let mockCount = 1

exports.mockMessageSend = (context) => {
  const message = {
    id: shortid(),
    userId: '__bot',
    channelId: 'general',
    content: `How are you doing? ${mockCount++}`,
    dateAdded: Date.now(),
  }
  messages.push(message)
  publishChange({
    type: 'added',
    message,
  }, context)
  return true
}

exports.reset = () => {
  messages = createDefaultMessages()
  mockCount = 1
}
