<script>
import { useCurrentUser } from '../util/useCurrentUser'
import { onLogout } from '../vue-apollo'
import USER_LOGOUT from '../graphql/userLogout.gql'
import { useMutation, useApolloClient } from '@vue/apollo-composable'

export default {
  name: 'MessageForm',

  setup () {
    const { currentUser } = useCurrentUser()
    const { mutate: logout, onDone } = useMutation(USER_LOGOUT)
    const { resolveClient } = useApolloClient()
    onDone(() => {
      onLogout(resolveClient())
    })

    return {
      currentUser,
      logout,
    }
  },
}
</script>

<template>
  <div class="user-current">
    <template v-if="currentUser">
      <i class="material-icons user-icon">account_circle</i>
      <div class="info">
        <div class="nickname">
          {{ currentUser.nickname }}
        </div>
        <div class="email">
          {{ currentUser.email }}
        </div>
      </div>
      <button
        class="icon-button"
        data-id="logout"
        @click="logout()"
      >
        <i class="material-icons">power_settings_new</i>
      </button>
    </template>
  </div>
</template>

<style lang="stylus" scoped>
@import '~@/style/imports'

.user-current
  color white
  display grid
  grid-template-columns auto 1fr auto
  grid-template-rows auto
  grid-gap 12px
  align-items center
  margin-bottom 20px
  padding 12px 0 12px 12px

.email
  font-size 12px

.icon-button
  &:not(:hover)
    background none
</style>
