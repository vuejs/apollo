import { addGqlError } from '../utils'

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
    const result = this.$scopedSlots.default({
      mutate: this.mutate,
      loading: this.loading,
      error: this.error,
      gqlError: this.error && this.error.gqlError,
    })
    return h(this.tag, result)
  },
}
