<script>
import gql from 'graphql-tag'

export default {
  created () {
    this.SEND = gql`
      mutation mockMessageSend {
        mockMessageSend
      }
    `
  },
}
</script>

<template>
  <ApolloMutation
    :mutation="SEND"
    class="mock-send-message"
  >
    <a
      slot-scope="{ mutate }"
      type="button"
      @click="mutate"
    >Send bot message</a>
  </ApolloMutation>
</template>

<style lang="stylus" scoped>
.mock-send-message
  margin-top 8px
  display flex
  align-items center
  justify-content center
</style>
