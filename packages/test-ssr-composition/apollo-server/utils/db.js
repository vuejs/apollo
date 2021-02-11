import Lowdb from 'lowdb'
// import FileSync from 'lowdb/adapters/FileSync'
import Memory from 'lowdb/adapters/Memory'
import mkdirp from 'mkdirp'
import { resolve } from 'path'

mkdirp(resolve(__dirname, '../../live'))

// export const db = new Lowdb(new FileSync(resolve(__dirname, '../../live/db.json')))
export const db = new Lowdb(new Memory())

// Seed an empty DB
db.defaults({
  messages: [
    {
      id: 'a',
      text: 'Message 1',
    },
    {
      id: 'b',
      text: 'Message 2',
    },
    {
      id: 'c',
      text: 'Message 3',
    },
  ],
  uploads: [],
}).write()
