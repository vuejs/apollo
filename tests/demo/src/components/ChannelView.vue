<script>
import MessageItem from './MessageItem.vue'
import MessageForm from './MessageForm.vue'

export default {
  name: 'ChannelView',

  components: {
    MessageItem,
    MessageForm,
  },

  props: {
    id: {
      type: String,
      required: true,
    },
  },

  watch: {
    id: {
      handler () {
        this.$_init = false
      },
      immediate: true,
    },
  },

  methods: {
    onMessageChanged (previousResult, { subscriptionData }) {
      const { type, message } = subscriptionData.data.messageChanged

      // No list change
      if (type === 'updated') return previousResult

      const messages = previousResult.channel.messages.slice()
      // Add or remove item
      if (type === 'added') {
        messages.push(message)
      } else if (type === 'removed') {
        const index = messages.findIndex(m => m.id === message.id)
        if (index !== -1) messages.splice(index, 1)
      }

      // New query result
      return {
        channel: {
          ...previousResult.channel,
          messages,
        },
      }
    },

    async scrollToBottom (force = false) {
      let el = this.$refs.body

      // No body element yet
      if (!el) {
        setTimeout(() => this.scrollToBottom(force), 100)
        return
      }
      // User is scrolling up => no auto scroll
      if (!force && el.scrollTop + el.clientHeight < el.scrollHeight - 100) return

      // Scroll to bottom
      await this.$nextTick()
      el.scrollTop = el.scrollHeight
    },

    onResult (result) {
      // The first time we load a channel, we force scroll to bottom
      this.scrollToBottom(!this.$_init)
      this.$_init = true
    },
  },
}
</script>

<template>
  <div class="channel-view">
    <ApolloQuery
      :query="require('../graphql/channel.gql')"
      :variables="{
        id
      }"
      @result="onResult"
    >
      <template slot-scope="{ result: { data, loading } }">
        <div v-if="!data && loading" class="loading">Loading...</div>

        <div v-else-if="data">
          <!-- Websockets -->
          <ApolloSubscribeToMore
            :document="require('../graphql/messageChanged.gql')"
            :variables="{
              channelId: id,
            }"
            :updateQuery="onMessageChanged"
          />

          <div class="wrapper">
            <div class="header">
              <div class="id">#{{ data.channel.id }}</div>
              <div class="name">{{ data.channel.name }}</div>
            </div>

            <div ref="body" class="body">
              <MessageItem
                v-for="message in data.channel.messages"
                :key="message.id"
                :message="message"
              />
            </div>

            <div class="footer">
              <MessageForm :channel-id="id" />
            </div>
          </div>
        </div>
      </template>
    </ApolloQuery>
  </div>
</template>

<style lang="stylus" scoped>
@import '~@/style/imports'

.wrapper
  height 100vh
  display grid
  grid-template-columns 1fr
  grid-template-rows auto 1fr auto

.header
  padding 12px
  border-bottom $border

.id
  font-family monospace
  margin-bottom 4px

.name
  color #555

.body
  overflow-x hidden
  overflow-y auto

.footer
  border-top $border
</style>
