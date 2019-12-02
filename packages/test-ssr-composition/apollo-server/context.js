import { db } from './utils/db'
import { processUpload } from './utils/upload'

// Context passed to all resolvers (third argument)
// req => Query
// connection => Subscription
// eslint-disable-next-line no-unused-vars
export default ({ req, connection }) => {
  return {
    db,
    processUpload

  }
}
