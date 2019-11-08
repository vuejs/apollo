const channels = [
  { id: 'general', name: 'General discussion' },
  { id: 'random', name: 'Have fun chatting!' },
  { id: 'help', name: 'Ask for or give help' },
]

exports.getAll = (context) => {
  return channels
}

exports.getOne = (id, context) => {
  return channels.find(c => c.id === id)
}
