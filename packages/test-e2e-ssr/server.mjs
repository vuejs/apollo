import fs from 'node:fs'
import { uneval } from 'devalue'
import express from 'express'
import { createServer } from 'vite'

const server = express()

const viteServer = await createServer({
  server: {
    middlewareMode: true,
  },
  appType: 'custom',
})
server.use(viteServer.middlewares)

server.get('*', async (req, res) => {
  try {
    const url = req.originalUrl
    console.log(url)

    let template = fs.readFileSync('./index.html', 'utf8')

    const { render } = await viteServer.ssrLoadModule('/src/entry-server.ts')
    const { html, context } = await render(url)

    console.log(context)

    template = template
      .replace('<!--state-->', uneval(context.state))
      .replace('<!--app-render-->', html)

    res.send(template)
  }
  catch (e) {
    console.error(e)
    res.send(e.stack)
  }
})

server.use(express.static('.'))

server.listen(8080, () => {
  console.log('Server is running on http://localhost:8080')
})
