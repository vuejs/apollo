import { DefaultApolloClient } from '@vue/apollo-composable'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { apolloClient } from './apollo'
import App from './components/App.vue'
import { router } from './router'
import '@/assets/styles/tailwind.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.provide(DefaultApolloClient, apolloClient)
app.mount('#app')
