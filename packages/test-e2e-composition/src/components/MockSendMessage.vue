<script>
import gql from 'graphql-tag'
import { useMutation } from '@vue/apollo-composable'

export default {
  setup () {
    const { mutate: send } = useMutation(gql`
      mutation mockMessageSend {
        mockMessageSend
      }
    `)

    return {
      send,
    }
  },
}
</script>

<template>
  <div class="mock-send-message">
    <a
      type="button"
      @click="send()"
    >Send bot message</a>
  </div>
</template>

<style lang="stylus" scoped>
.mock-send-message
  margin-top 8px
  display flex
  align-items center
  justify-content center
</style>
