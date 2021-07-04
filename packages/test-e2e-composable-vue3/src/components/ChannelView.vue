<script>
import { gql } from '@apollo/client/core'
import { defineComponent, onMounted, ref, watch } from 'vue'
import { useQuery, useResult } from '@vue/apollo-composable'
import MessageItem from './MessageItem.vue'
import MessageForm from './MessageForm.vue'

export default defineComponent({
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
    const { result, loading, refetch } = useQuery(gql`
      query channel ($id: ID!) {
        channel (id: $id) {
          id
          label
          messages {
            id
            text
          }
        }
      }
    `, () => ({
      id: props.id,
    }), {
      notifyOnNetworkStatusChange: true,
    })
    const channel = useResult(result)

    const messagesEl = ref()

    function scrollToBottom () {
      if (!messagesEl.value) return
      messagesEl.value.scrollTop = messagesEl.value.scrollHeight
    }

    watch(() => channel.value?.messages, () => {
      scrollToBottom()
    })

    onMounted(() => {
      scrollToBottom()
    })

    return {
      loading,
      refetch,
      channel,
      messagesEl,
    }
  },
})
</script>

<template>
  <div
    v-if="loading"
    class="loading-channel"
  >
    Loading channel...
  </div>

  <div
    v-else
    class="flex flex-col"
  >
    <div class="flex-none p-6 border-b border-gray-200 bg-white">
      Currently viewing # {{ channel.label }}

      <a
        class="text-green-500 cursor-pointer"
        data-test-id="refetch"
        @click="refetch()"
      >Refetch</a>
    </div>

    <div
      ref="messagesEl"
      class="flex-1 overflow-y-auto"
    >
      <MessageItem
        v-for="message of channel.messages"
        :key="message.id"
        :message="message"
        class="m-2"
      />
    </div>

    <MessageForm
      :channel-id="channel.id"
      class="flex-none m-2 mt-0"
    />
  </div>
</template>
