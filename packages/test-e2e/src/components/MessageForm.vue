<script>
import MESSAGE_FRAGMENT from '../graphql/messageFragment.gql'
import USER_FRAGMENT from '../graphql/userFragment.gql'

export default {
  props: {
    channelId: {
      type: String,
      required: true,
    },
  },

  data () {
    return {
      newMessage: '',
    }
  },

  methods: {
    onDone () {
      this.newMessage = ''
      this.$refs.input.focus()
    },
  },

  fragments: {
    message: MESSAGE_FRAGMENT,
    user: USER_FRAGMENT,
  },
}
</script>

<template>
  <ApolloMutation
    :mutation="gql => gql`
      mutation messageAdd ($input: MessageAdd!) {
        messageAdd (input: $input) {
          ...message
        }
      }
      ${$options.fragments.message}
      ${$options.fragments.user}
    `"
    :variables="{
      input: {
        channelId,
        content: newMessage,
      },
    }"
    class="message-form"
    @done="onDone"
  >
    <input
      ref="input"
      v-model="newMessage"
      slot-scope="{ mutate, loading }"
      :disabled="loading"
      class="form-input"
      placeholder="Type a message"
      @keyup.enter="newMessage && mutate()"
    >
  </ApolloMutation>
</template>

<style lang="stylus" scoped>
@import '~@/style/imports'

.message-form
  padding 12px
  width 100%
  box-sizing border-box

  .form-input
    display block
    box-sizing border-box
    width 100%
</style>
