const shortid = require('shortid')

function createDefaultUsers() {
  return [
    {
      id: '__bot',
      email: 'bot@bot.com',
      password: 'bot',
      nickname: 'The Bot',
      tokens: [],
    },
  ]
}

let users = createDefaultUsers()

exports.register = (input, context) => {
  if (users.find(u => u.email === input.email)) {
    throw new Error('Email already used')
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      users.push({
        id: shortid(),
        email: input.email,
        password: input.password,
        nickname: input.nickname,
        tokens: [],
      })

      resolve(true)
    }, 100)
  })
}

exports.login = ({ email, password }, context) => {
  const user = users.find(
    u => u.email === email && u.password === password,
  )
  if (!user)
    throw new Error('User not found')
  const token = {
    id: shortid(),
    userId: user.id,
    expiration: Date.now() + 24 * 3600 * 1000,
  }
  user.tokens.push(token)
  return {
    user,
    token,
  }
}

exports.logout = (context) => {
  if (context.userId && context.token) {
    const user = exports.getOne(context.userId)
    if (user) {
      const index = user.tokens.findIndex(t => t.id === context.token.id)
      if (index !== -1)
        user.tokens.splice(index, 1)
    }
  }
  return true
}

exports.getOne = (id, context) => {
  return users.find(u => u.id === id)
}

exports.validateToken = (token) => {
  const user = exports.getOne(token.userId)
  if (user) {
    const storedToken = user.tokens.find(t => t.id === token.id)
    if (storedToken) {
      return storedToken.expiration === token.expiration && storedToken.expiration > Date.now()
    }
  }
  return false
}

exports.current = (context) => {
  if (!context.userId)
    throw new Error('Unauthorized')
  return exports.getOne(context.userId, context)
}

exports.reset = () => {
  users = createDefaultUsers()
}
