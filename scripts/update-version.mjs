import fs from 'fs'
const lernaConfig = JSON.parse(fs.readFileSync('lerna.json', { encoding: 'utf8' }))
const pkgData = JSON.parse(fs.readFileSync('package.json', { encoding: 'utf-8' }))
pkgData.version = lernaConfig.version
fs.writeFileSync('package.json', JSON.stringify(pkgData, null, 2) + '\n', { encoding: 'utf-8' })
