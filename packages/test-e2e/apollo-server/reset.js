exports.reset = () => {
  require('./connectors/messages.js').reset()
  require('./connectors/users.js').reset()
}
