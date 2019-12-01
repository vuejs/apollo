<script>
import { ref } from '@vue/composition-api'
import { useMutation } from '@vue/apollo-composable'
import gql from 'graphql-tag'
import MESSAGE_FRAGMENT from '../graphql/messageFragment.gql'
import USER_FRAGMENT from '../graphql/userFragment.gql'

export default {
  props: {
    channelId: {
      type: String,
      required: true,
    },
  },

  setup (props) {
    const input = ref()
    const newMessage = ref('')

    const { mutate: send, loading, onDone } = useMutation(gql`
      mutation messageAdd ($input: MessageAdd!) {
        messageAdd (input: $input) {
          ...message
        }
      }
      ${MESSAGE_FRAGMENT}
      ${USER_FRAGMENT}
    `, () => ({
      variables: {
        input: {
          channelId: props.channelId,
          content: newMessage.value,
        },
      },
    }))

    onDone(() => {
      newMessage.value = ''
      input.value.focus()
    })

    return {
      input,
      newMessage,
      send,
      loading,
    }
  },
}
</script>

<template>
  <div class="message-form">
    <input
      ref="input"
      v-model="newMessage"
      :disabled="loading"
      class="form-input"
      placeholder="Type a message"
      @keyup.enter="newMessage && send()"
    >
  </div>
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
