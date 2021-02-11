<script>
import Vue from 'vue'
import { watch, ref } from '@vue/composition-api'
import { useQuery, useResult } from '@vue/apollo-composable'
import MessageItem from './MessageItem.vue'
import MessageForm from './MessageForm.vue'
import CHANNEL from '../graphql/channel.gql'
import MESSAGE_CHANGED from '../graphql/messageChanged.gql'

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

  setup (props) {
    let init = false
    const body = ref()

    watch(() => props.id, value => {
      init = false
    })

    const { result, loading, subscribeToMore } = useQuery(CHANNEL, () => ({
      id: props.id,
    }))
    const channel = useResult(result)

    // The first time we load a channel, we force scroll to bottom
    watch(channel, value => {
      if (value) {
        scrollToBottom(!init)
        init = true
      }
    })

    subscribeToMore(() => ({
      document: MESSAGE_CHANGED,
      variables: {
        channelId: props.id,
      },
      updateQuery: (previousResult, { subscriptionData }) => {
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
    }))

    async function scrollToBottom (force = false) {
      const el = body.value

      // No body element yet
      if (!el) {
        setTimeout(() => scrollToBottom(force), 100)
        return
      }
      // User is scrolling up => no auto scroll
      if (!force && el.scrollTop + el.clientHeight < el.scrollHeight - 100) return

      // Scroll to bottom
      await Vue.nextTick()
      el.scrollTop = el.scrollHeight
    }

    return {
      body,
      loading,
      channel,
    }
  },
}
</script>

<template>
  <div class="channel-view">
    <div
      v-if="loading"
      class="loading"
    >
      Loading...
    </div>

    <div v-else-if="channel">
      <div class="wrapper">
        <div class="header">
          <div class="id">
            #{{ channel.id }}
          </div>
          <div class="name">
            {{ channel.name }}
          </div>
        </div>

        <div
          ref="body"
          class="body"
        >
          <MessageItem
            v-for="message in channel.messages"
            :key="message.id"
            :message="message"
          />
        </div>

        <div class="footer">
          <MessageForm :channel-id="id" />
        </div>
      </div>
    </div>
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
