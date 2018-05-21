import { willPrefetch } from '../index'
import gql from 'graphql-tag'

export default willPrefetch({
  apollo: {
    allPosts: {
      query: gql`query AllPosts {
        allPosts {
          id
          imageUrl
          description
        }
      }`,
      prefetch: true, // Don't forget this
    }
  }
})