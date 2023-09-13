import 'isomorphic-fetch'
import { renderToString } from 'vue/server-renderer'
import { createMyApp } from './app.js'
import { Context } from '@apollo/client'

export async function render (url: string) {
  const {
    app,
    router,
    apolloClient,
  } = await createMyApp()

  await router.push(url)
  await router.isReady()

  const context: Context = {
    state: {},
  }

  const html = await renderToString(app, context)

  context.state.apollo = apolloClient.extract()

  return {
    html,
    context,
  }
}
