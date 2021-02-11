import Vue from 'vue'
import App from './App.vue'
import { createRouter } from './router'
import { createProvider } from './vue-apollo'

Vue.config.productionTip = false

export async function createApp ({
  beforeApp = () => {},
  afterApp = () => {},
} = {}) {
  const router = createRouter()

  const apolloProvider = createProvider({
    ssr: process.server,
  })

  await beforeApp({
    router,

    apolloProvider,
  })

  const app = new Vue({
    router,
    apolloProvider,
    render: h => h(App),
  })

  const result = {
    app,
    router,

    apolloProvider,
  }

  await afterApp(result)

  return result
}
