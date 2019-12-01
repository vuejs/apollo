import { useQuery, useResult } from '@vue/apollo-composable'
import USER_CURRENT from '../graphql/userCurrent.gql'

export function useCurrentUser () {
  const { result } = useQuery(USER_CURRENT)
  const currentUser = useResult(result)

  return {
    currentUser,
  }
}
