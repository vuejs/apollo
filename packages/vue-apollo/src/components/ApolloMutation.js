import { addGqlError } from '../../lib/utils'
import gql from 'graphql-tag'

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
  },

  data () {
    return {
      loading: false,
      error: null,
    }
  },

  watch: {
    loading (value) {
      this.$emit('loading', value)
    },
  },

  methods: {
    mutate (options) {
      this.loading = true
      this.error = null

      let mutation = this.mutation
      if (typeof mutation === 'function') {
        mutation = mutation(gql)
      }

      this.$apollo.mutate({
        mutation,
        client: this.clientId,
        variables: this.variables,
        optimisticResponse: this.optimisticResponse,
        update: this.update,
        refetchQueries: this.refetchQueries,
        ...options,
      }).then(result => {
        this.$emit('done', result)
        this.loading = false
      }).catch(e => {
        addGqlError(e)
        this.error = e
        this.$emit('error', e)
        this.loading = false
      })
    },
  },

  render (h) {
    let result = this.$scopedSlots.default({
      mutate: this.mutate,
      loading: this.loading,
      error: this.error,
      gqlError: this.error && this.error.gqlError,
    })
    if (Array.isArray(result)) {
      result = result.concat(this.$slots.default)
    } else {
      result = [result].concat(this.$slots.default)
    }
    return this.tag ? h(this.tag, result) : result[0]
  },
}
