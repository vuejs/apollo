import Vue from 'vue'
import VueCompositionAPI, { provide } from '@vue/composition-api'
import { DefaultApolloClient } from '@vue/apollo-composable'
import App from './App.vue'
import { createRouter } from './router'
import { createClient } from './vue-apollo'

Vue.use(VueCompositionAPI)

Vue.config.productionTip = false

export async function createApp ({
  beforeApp = () => {},
  afterApp = () => {}
} = {}) {
  const router = createRouter()

  const apolloClient = createClient({
    ssr: process.server
  })

  await beforeApp({
    router,
    apolloClient
  })

  const app = new Vue({
    router,

    setup () {
      provide(DefaultApolloClient, apolloClient)
    },

    render: h => h(App)
  })

  const result = {
    app,
    router,
    apolloClient
  }

  await afterApp(result)

  return result
}
