import { addGqlError } from '@vue/apollo-option/lib/utils'
import gql from 'graphql-tag'
import { h } from 'vue'

export default {
  props: {
    mutation: {
      type: [Function, Object],
      required: true,
    },

    variables: {
      type: Object,
      default: undefined,
    },

    optimisticResponse: {
      type: Object,
      default: undefined,
    },

    update: {
      type: Function,
      default: undefined,
    },

    refetchQueries: {
      type: Function,
      default: undefined,
    },

    clientId: {
      type: String,
      default: undefined,
    },

    tag: {
      type: String,
      default: 'div',
    },

    context: {
      type: Object,
      default: undefined,
    },
  },

  data() {
    return {
      loading: false,
      error: null,
    }
  },

  emits: ['loading', 'done', 'error'],

  watch: {
    loading(value) {
      this.$emit('loading', value)
    },
  },

  methods: {
    mutate(options) {
      this.loading = true
      this.error = null

      let mutation = this.mutation
      if (typeof mutation === 'function') {
        mutation = mutation(gql)
      }

      return this.$apollo.mutate({
        mutation,
        client: this.clientId,
        variables: this.variables,
        optimisticResponse: this.optimisticResponse,
        update: this.update,
        refetchQueries: this.refetchQueries,
        context: this.context,
        ...options,
      }).then((result) => {
        this.$emit('done', result)
        this.loading = false
        return result
      }).catch((e) => {
        addGqlError(e)
        this.error = e
        this.$emit('error', e)
        this.loading = false
      })
    },
  },

  render() {
    const result = this.$slots.default({
      mutate: this.mutate,
      loading: this.loading,
      error: this.error,
      gqlError: this.error && this.error.gqlError,
    })
    return this.tag ? h(this.tag, result) : result
  },
}
