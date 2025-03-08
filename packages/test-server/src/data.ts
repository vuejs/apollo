export interface Channel {
  id: string
  label: string
  messages: Message[]
}

export interface Message {
  id: string
  channel: Channel
  text: string
}

export let channels: Channel[] = []

export function resetDatabase(): void {
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

export function seedDatabase(): void {
  channels[0].messages = [
    {
      id: '1',
      channel: channels[0],
      text: 'Meow?',
    },
    {
      id: '2',
      channel: channels[0],
      text: 'Meow!',
    },
  ]
  channels[1].messages = [
    {
      id: '3',
      channel: channels[1],
      text: 'Hello world!',
    },
  ]
}

resetDatabase()
