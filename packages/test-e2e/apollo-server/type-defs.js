const fs = require('node:fs')
const path = require('node:path')

module.exports = fs.readFileSync(path.resolve(__dirname, './schema.graphql'), { encoding: 'utf8' })
