<template>
  <div>
    <div v-if="loading > 0">
      Loading...
    </div>
    <div v-else>
      {{ number }}
    </div>

    <div>{{ json(history) }}</div>
  </div>
</template>

<script>
import gql from 'graphql-tag'
export default {
  data () {
    return {
      loading: 0,
      number: null,
      history: [],
    }
  },

  mounted () {
    this.$apollo.addSmartQuery('number', {
      query: gql`
        query {
          number: loadNumber
        }
      `,
      loadingKey: 'loading',
      watchLoading: (isLoading, countModifier) => {
        console.log(isLoading, countModifier)
        this.history.push({ isLoading, countModifier })
      },
    })
  },

  methods: {
    json (value) {
      return JSON.stringify(value)
    },
  },
}
</script>
