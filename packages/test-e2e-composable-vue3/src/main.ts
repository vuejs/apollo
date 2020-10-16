import { createApp, h, provide } from 'vue'
import { DefaultApolloClient } from '../../vue-apollo-composable/dist'
import { apolloClient } from './apollo'
import App from './App.vue'
import '@/assets/styles/tailwind.postcss'

createApp({
  setup () {
    provide(DefaultApolloClient, apolloClient)
  },
  render: () => h(App),
}).mount('#app')
