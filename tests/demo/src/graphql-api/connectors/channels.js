const channels = [
  { id: 'general', name: 'General' },
  { id: 'random', name: 'Random' },
  { id: 'help', name: 'Help' },
]

exports.getAll = (context) => {
  return channels
}

exports.getOne = (id, context) => {
  return channels.find(c => c.id === id)
}
