import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const file = path.join(process.cwd(), 'dist', 'esm', 'package.json')

fs.writeFileSync(file, JSON.stringify({
  type: 'module',
}, null, 2), 'utf-8')
