import { createApp } from 'vue'
import { DefaultApolloClient } from '@vue/apollo-composable'
import { createApollo } from './apollo'
import App from './components/App.vue'
import { createMyRouter } from './router'
import '@/assets/styles/tailwind.css'

export function createMyApp () {
  const app = createApp(App)

  const { apolloClient } = createApollo()
  app.provide(DefaultApolloClient, apolloClient)

  const { router } = createMyRouter()
  app.use(router)

  return {
    app,
    router,
    apolloClient,
  }
}
