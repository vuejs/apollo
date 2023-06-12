export let channels = []

export function resetDatabase () {
  channels = [
    {
      id: 'general',
      label: 'General',
      messages: [],
    },
    {
      id: 'random',
      label: 'Random',
      messages: [],
    },
  ]
}

resetDatabase()
