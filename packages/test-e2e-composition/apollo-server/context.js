const users = require('./connectors/users')

// Context passed to all resolvers (third argument)
// req => Query
// connection => Subscription
// eslint-disable-next-line no-unused-vars
module.exports = ({ req, connection }) => {
  // If the websocket context was already resolved
  if (connection && connection.context) return connection.context

  let rawToken
  // HTTP
  if (req) rawToken = req.get('Authorization')
  // Websocket
  if (connection) rawToken = connection.authorization

  // Token
  const token = rawToken ? JSON.parse(rawToken) : null
  let userId

  // User validation
  if (token && users.validateToken(token)) {
    userId = token.userId
  }

  return {
    token,
    userId,
  }
}
