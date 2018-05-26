<template>
  <div class="user-current">
    <template v-if="userCurrent">
      <i class="material-icons user-icon">account_circle</i>
      <div class="info">
        <div class="nickname">{{ userCurrent.nickname }}</div>
        <div class="email">{{ userCurrent.email }}</div>
      </div>
      <button
        class="icon-button"
        @click="logout()"
      >
        <i class="material-icons">power_settings_new</i>
      </button>
    </template>
  </div>
</template>

<script>
import UserCurrent from '../mixins/UserCurrent'
import { onLogout } from '../vue-apollo'
import USER_LOGOUT from '../graphql/userLogout.gql'

export default {
  name: 'MessageForm',

  mixins: [
    UserCurrent,
  ],

  methods: {
    async logout () {
      await this.$apollo.mutate({
        mutation: USER_LOGOUT,
      })
      const apolloClient = this.$apollo.provider.defaultClient
      onLogout(apolloClient)
    },
  },
}
</script>

<style lang="stylus" scoped>
@import '~@/style/imports'

.user-current
  color white
  display grid
  grid-template-columns auto 1fr auto
  grid-template-rows auto
  grid-gap 8px
  align-items center
  margin-bottom 20px
  padding 8px 0 8px 8px

.email
  font-size 12px

.icon-button
  &:not(:hover)
    background none
</style>
