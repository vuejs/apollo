<script>
import { ref, reactive, watch } from '@vue/composition-api'
import { useApolloClient, useMutation } from '@vue/apollo-composable'
import { useCurrentUser } from '../util/useCurrentUser'
import USER_CURRENT from '../graphql/userCurrent.gql'
import USER_REGISTER from '../graphql/userRegister.gql'
import USER_LOGIN from '../graphql/userLogin.gql'
import { onLogin } from '../vue-apollo'

export default {
  name: 'UserLogin',

  setup (props, { root }) {
    const { currentUser } = useCurrentUser()

    const { resolveClient } = useApolloClient()

    const showRegister = ref(false)
    const formData = reactive({
      email: '',
      password: '',
      nickname: '',
    })

    const { mutate, loading, error, onDone } = useMutation(
      () => showRegister.value ? USER_REGISTER : USER_LOGIN,
      () => ({
        variables: showRegister.value
          ? {
            input: {
              ...formData,
            },
          }
          : {
            email: formData.email,
            password: formData.password,
          },
      }),
    )

    onDone(async result => {
      if (showRegister.value) {
        showRegister.value = false
      } else {
        if (!result.data.userLogin) return
        const apolloClient = resolveClient()
        // Update token and reset cache
        const { id, userId, expiration } = result.data.userLogin.token
        await onLogin(apolloClient, { id, userId, expiration })
        // Update cache
        apolloClient.writeQuery({
          query: USER_CURRENT,
          data: {
            userCurrent: result.data.userLogin.user,
          },
        })
      }
    })

    watch(currentUser, value => {
      if (value) {
        redirect()
      }
    })

    function redirect () {
      root.$router.replace(root.$route.params.wantedRoute || { name: 'home' })
    }

    return {
      currentUser,
      showRegister,
      formData,
      mutate,
      loading,
      error,
    }
  },
}
</script>

<template>
  <div class="user-login">
    <div class="logo">
      <i class="material-icons icon">chat</i>
    </div>
    <div class="app-name">
      Apollo<b>Chat</b>
    </div>
    <div class="wrapper">
      {{ currentUser }}
      <form
        :key="showRegister"
        class="form"
        @submit.prevent="mutate()"
      >
        <input
          v-model="formData.email"
          class="form-input"
          type="email"
          name="email"
          placeholder="Email"
          required
        >
        <input
          v-model="formData.password"
          class="form-input"
          type="password"
          name="password"
          placeholder="Password"
          required
        >
        <input
          v-if="showRegister"
          v-model="formData.nickname"
          class="form-input"
          name="nickname"
          placeholder="Nickname"
          required
        >
        <div
          v-if="error"
          class="error"
        >
          {{ error.message }}
        </div>
        <template v-if="!showRegister">
          <button
            type="submit"
            :disabled="loading"
            class="button"
            data-id="login"
          >
            Login
          </button>
          <div class="actions">
            <a
              data-id="create-account"
              @click="showRegister = true"
            >Create an account</a>
          </div>
        </template>
        <template v-else>
          <button
            type="submit"
            :disabled="loading"
            class="button"
            data-id="submit-new-account"
          >
            Create new account
          </button>
          <div class="actions">
            <a @click="showRegister = false">Go back</a>
          </div>
        </template>
      </form>
    </div>
  </div>
</template>

<style lang="stylus" scoped>
@import '~@/style/imports'

.user-login
  height 100%
  display flex
  flex-direction column
  align-items center
  justify-content center

.logo
  .icon
    font-size 80px
    color $color

.app-name
  font-size 42px
  font-weight lighter
  margin-bottom 32px

.wrapper
  flex auto 0 0

.form
  width 100vw
  max-width 300px

.form-input,
.button
  display block
  width 100%
  box-sizing border-box

.form-input
  margin-bottom 12px

.actions
  margin-top 12px
  text-align center
  font-size 12px
</style>
