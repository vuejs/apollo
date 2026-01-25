<script lang="ts" setup>
import { useQuery } from '@vue/apollo-composable'
import gql from 'graphql-tag'
import { computed, ref } from 'vue'

const pollInterval = ref<number | undefined>(500)
const manualPollInterval = ref<number>(1000)

const { result, loading, startPolling, stopPolling, onResult } = useQuery(gql`
  query channels {
    channels {
      id
      label
    }
  }
`, undefined, () => ({
  pollInterval: pollInterval.value,
  fetchPolicy: 'network-only',
}))

const channels = computed(() => result.value?.channels ?? [])
const pollCount = ref(0)

onResult(() => {
  pollCount.value++
})

function handleStartPolling() {
  startPolling(manualPollInterval.value)
}

function handleStopPolling() {
  stopPolling()
}

function handleChangePollInterval() {
  pollInterval.value = manualPollInterval.value
}
</script>

<template>
  <div class="m-6">
    <h2 class="text-xl font-bold mb-4">Polling Test</h2>

    <div class="mb-4 space-y-2">
      <div>
        <label class="block mb-1">Poll Interval (ms):</label>
        <input
          v-model.number="pollInterval"
          type="number"
          class="border rounded p-2"
          data-test-id="poll-interval-input"
        />
        <span class="ml-2 text-sm text-gray-600">Current: {{ pollInterval ?? 'none' }}ms</span>
      </div>

      <div>
        <label class="block mb-1">Manual Poll Interval (ms):</label>
        <input
          v-model.number="manualPollInterval"
          type="number"
          class="border rounded p-2"
          data-test-id="manual-poll-interval-input"
        />
      </div>

      <div class="flex gap-2">
        <button
          class="bg-blue-500 text-white rounded-lg p-2"
          @click="handleStartPolling"
          data-test-id="start-polling-btn"
        >
          Start Polling ({{ manualPollInterval }}ms)
        </button>
        <button
          class="bg-red-500 text-white rounded-lg p-2"
          @click="handleStopPolling"
          data-test-id="stop-polling-btn"
        >
          Stop Polling
        </button>
        <button
          class="bg-green-500 text-white rounded-lg p-2"
          @click="handleChangePollInterval"
          data-test-id="change-poll-interval-btn"
        >
          Change Poll Interval
        </button>
      </div>
    </div>

    <div
      v-if="loading"
      class="loading mb-4"
      data-test-id="loading"
    >
      Loading...
    </div>

    <div
      v-if="channels.length > 0"
      data-test-id="channels"
    >
      <div class="mb-2">
        <strong>Poll Count:</strong> <span data-test-id="poll-count">{{ pollCount }}</span>
      </div>
      <div class="mb-2">
        <strong>Channels:</strong>
      </div>
      <ul class="list-disc list-inside">
        <li
          v-for="channel in channels"
          :key="channel.id"
          class="channel-item"
        >
          {{ channel.label }}
        </li>
      </ul>
    </div>
  </div>
</template>
