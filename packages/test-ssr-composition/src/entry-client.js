import 'isomorphic-fetch'
import { loadAsyncComponents } from '@akryum/vue-cli-plugin-ssr/client'

import { createApp } from './main'

createApp({
  async beforeApp ({
    router
  }) {
    await loadAsyncComponents({ router })
  },

  afterApp ({
    app,
    router
  }) {
    router.onReady(() => {
      app.$mount('#app')
    })
  }
})
