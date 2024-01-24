<script lang="ts">
import { apolloClient } from '@/apollo'
import gql from 'graphql-tag'
import { provideApolloClient, useQuery } from '@vue/apollo-composable'
import { ref, defineComponent, hasInjectionContext, effectScope, computed, watch, onBeforeUnmount } from 'vue'

const hello = ref('')
const scope = effectScope()

scope.run(() => {
  const query = provideApolloClient(apolloClient)(() => useQuery(gql`
    query hello {
      hello
    }
  `))
  const innerHello = computed(() => query.result.value?.hello ?? '')

  watch(innerHello, (newHello) => {
    hello.value = newHello
  }, {
    immediate: true,
  })
})

export default defineComponent({
  setup () {
    onBeforeUnmount(() => {
      scope.stop()
    })

    return {
      hello,
    }
  },
})
</script>

<template>
  <div class="no-setup-scope-query">
    {{ hello }}
  </div>
</template>
