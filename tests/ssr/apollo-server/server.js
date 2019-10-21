import ssrMiddleware from '@akryum/vue-cli-plugin-ssr/lib/app'
import path from 'path'
import express from 'express'

export default app => {
  app.use('/files', express.static(path.resolve(__dirname, '../live/uploads')))

  ssrMiddleware(app, { prodOnly: true })
}
