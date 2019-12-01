import Vue from 'vue'
import VueCompositionApi, { provide } from '@vue/composition-api'
import { DefaultApolloClient } from '@vue/apollo-composable'
import App from './App.vue'
import router from './router'
import store from './store'
import { createClient } from './vue-apollo'

Vue.use(VueCompositionApi)

Vue.config.productionTip = false

const apolloClient = createClient({}, { router })

new Vue({
  router,
  store,
  setup () {
    provide(DefaultApolloClient, apolloClient)
  },
  ...App,
}).$mount('#app')
