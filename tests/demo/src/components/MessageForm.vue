<template>
  <ApolloMutation
    :mutation="require('../graphql/messageAdd.gql')"
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
      slot-scope="{ mutate, loading, error }"
      ref="input"
      v-model="newMessage"
      :disabled="loading"
      class="form-input"
      placeholder="Type a message"
      @keyup.enter="newMessage && mutate()"
    >
  </ApolloMutation>
</template>

<script>
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
}
</script>

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
