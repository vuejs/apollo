import { addGqlError } from '../../lib/utils'

export default {
  props: {
    mutation: {
      type: Object,
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

  methods: {
    mutate (options) {
      this.loading = true
      this.error = null
      this.$apollo.mutate({
        mutation: this.mutation,
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
    return h(this.tag, result)
  },
}
