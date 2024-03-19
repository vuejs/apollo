<script lang="ts" setup>
import MessageForm from './MessageForm.vue'
import Subscription from './Subscription.vue'
</script>

<template>
  <div class="m-12 space-y-4">
    <h1 class="text-2xl">
      Subscription
    </h1>
    <MessageForm channel-id="general" />
    <div class="flex gap-4">
      <Subscription
        v-for="n in 3"
        :key="n"
        class="flex-1"
      />
    </div>
  </div>
</template>
