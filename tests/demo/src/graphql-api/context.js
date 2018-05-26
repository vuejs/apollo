const users = require('./connectors/users')

// Context passed to all resolvers (third argument)
// req => Query
// connection => Subscription
// eslint-disable-next-line no-unused-vars
module.exports = (req, connection) => {
  const bearer = req ? req.get('Authorization') : null
  const token = bearer ? JSON.parse(bearer) : null
  let userId

  if (token && users.validateToken(token)) {
    userId = token.userId
  }

  return {
    token,
    userId,
  }
}
