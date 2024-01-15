import path from 'node:path'
import fs from 'node:fs'

const file = path.join(process.cwd(), 'dist', 'esm', 'package.json')

fs.writeFileSync(file, JSON.stringify({
  "type": "module",
}, null, 2), 'utf-8')
