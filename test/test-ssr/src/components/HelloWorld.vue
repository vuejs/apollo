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
import HELLO_WORLD from '../graphql/HelloWorld.gql'

export default {
  data () {
    return {
      name: '',
    }
  },

  apollo: {
    hello: {
      query: HELLO_WORLD,
      variables () {
        return {
          name: this.name,
        }
      },
    },
  },
}
</script>
