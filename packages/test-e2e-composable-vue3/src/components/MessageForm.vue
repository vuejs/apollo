<script lang="ts">
import { gql } from '@apollo/client/core'
import { useMutation } from '@vue/apollo-composable'
import { defineComponent, ref } from 'vue'

export default defineComponent({
  props: {
    channelId: {
      type: String,
      required: true,
    },
  },

  setup (props) {
    const text = ref('')

    const { mutate } = useMutation(gql`
      mutation sendMessage ($input: AddMessageInput!) {
        message: addMessage (input: $input) {
          id
          text
        }
      }
    `, {
      update: (cache, { data: { message } }) => {
        cache.modify({
          id: cache.identify({
            __typename: 'Channel',
            id: props.channelId,
          }),
          fields: {
            messages: (existingMessages = []) => [
              ...existingMessages,
              message,
            ],
          },
        })
      },
    })

    async function sendMessage () {
      await mutate({
        input: {
          channelId: props.channelId,
          text: text.value,
        },
      }, {
        optimisticResponse: {
          __typename: 'Mutation',
          message: {
            id: Date.now().toString(),
            text: text.value,
          },
        },
      })
      text.value = ''
    }

    return {
      text,
      sendMessage,
    }
  },
})
</script>

<template>
  <div class="border border-gray-200 rounded-lg bg-white">
    <input
      v-model="text"
      placeholder="Type a message..."
      class="w-full px-4 py-2 bg-transparent"
      @keyup.enter="sendMessage()"
    >
  </div>
</template>
