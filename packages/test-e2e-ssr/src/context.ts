export interface Context {
  state: {
    apollo?: any
  }
}

declare global {
  interface Window {
    _INITIAL_STATE_: Context['state']
  }
}
