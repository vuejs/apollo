import VueApolloComponents from '@vue/apollo-components'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import { apolloProvider } from './vue-apollo'

const app = createApp(App)
app.use(router)
app.use(store)
app.use(apolloProvider)
app.use(VueApolloComponents)
app.mount('#app')
