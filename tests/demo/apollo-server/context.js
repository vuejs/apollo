const users = require('./connectors/users')

// Context passed to all resolvers (third argument)
// req => Query
// connection => Subscription
// eslint-disable-next-line no-unused-vars
module.exports = ({ req, connection }) => {
  console.log('connection:', connection)
  let rawToken
  if (req) rawToken = req.get('Authorization')
  if (connection) rawToken = connection.authorization
  const token = rawToken ? JSON.parse(rawToken) : null
  let userId

  if (token && users.validateToken(token)) {
    userId = token.userId
  }

  console.log('token:', token, 'userId:', userId)

  return {
    token,
    userId,
  }
}
