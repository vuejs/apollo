<template>
  <div class="hello">
    <input
      v-model="name"
      class="input"
    >
    <div class="hello">
      {{ hello }}
    </div>
  </div>
</template>

<script>
import { ref, computed } from '@vue/composition-api'
import { useQuery } from '@vue/apollo-composable'
import HELLO_WORLD from '../graphql/HelloWorld.gql'

export default {
  setup () {
    const name = ref('')
    const { result } = useQuery(HELLO_WORLD, () => ({
      name: name.value,
    }))
    const hello = computed(() => result.value?.hello)
    return {
      name,
      hello,
    }
  },
}
</script>
