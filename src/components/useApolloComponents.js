import CApolloQuery from './components/ApolloQuery'
import CApolloSubscribeToMore from './components/ApolloSubscribeToMore'
import CApolloMutation from './components/ApolloMutation'

// Components
export const ApolloQuery = CApolloQuery
export const ApolloSubscribeToMore = CApolloSubscribeToMore
export const ApolloMutation = CApolloMutation

export function install (vue) {
  vue.component('apollo-query', CApolloQuery)
  vue.component('ApolloQuery', CApolloQuery)
  vue.component('apollo-subscribe-to-more', CApolloSubscribeToMore)
  vue.component('ApolloSubscribeToMore', CApolloSubscribeToMore)
  vue.component('apollo-mutation', CApolloMutation)
  vue.component('ApolloMutation', CApolloMutation)
}
