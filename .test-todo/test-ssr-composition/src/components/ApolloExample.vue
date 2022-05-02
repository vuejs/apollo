<script>
import { computed } from '@vue/composition-api'
import { useQuery } from '@vue/apollo-composable'
import MESSAGES from '../graphql/Messages.gql'
import MESSAGE_ADDED from '../graphql/MessageAdded.gql'

export default {
  setup () {
    const { result, subscribeToMore } = useQuery(MESSAGES)
    const messages = computed(() => result.value?.messages ?? [])

    subscribeToMore({
      document: MESSAGE_ADDED,
      updateQuery (previousResult, { subscriptionData }) {
        return {
          messages: [
            ...previousResult.messages,
            subscriptionData.data.messageAdded,
          ],
        }
      },
    })

    return {
      messages,
    }
  },
}
</script>

<template>
  <div class="apollo-example">
    <!-- Tchat example -->
    <div>
      <template v-if="messages">
        <div
          v-for="message of messages"
          :key="message.id"
          class="message"
        >
          {{ message.text }}
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.form,
.input,
.apollo,
.message {
  padding: 12px;
}

label {
  display: block;
  margin-bottom: 6px;
}

.input {
  font-family: inherit;
  font-size: inherit;
  border: solid 2px #ccc;
  border-radius: 3px;
}

.error {
  color: red;
}

.images {
  display: grid;
  grid-template-columns: repeat(auto-fill, 300px);
  grid-auto-rows: 300px;
  grid-gap: 10px;
}

.image-item {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ccc;
  border-radius: 8px;
}

.image {
  max-width: 100%;
  max-height: 100%;
}

.image-input {
  margin: 20px;
}
</style>
