import { createMyApp } from './app.js'

const { app, router } = createMyApp()

router.isReady().then(() => {
  app.mount('#app')
})
