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

export function resetDatabase (): void {
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
