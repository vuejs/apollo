function isDataFilled (data) {
  return Object.keys(data).length > 0
}

export default {
  name: 'ApolloQuery',

  provide () {
    return {
      getDollarApollo: this.getDollarApollo,
      getApolloQuery: this.getApolloQuery,
    }
  },

  props: {
    query: {
      type: Object,
      required: true,
    },

    variables: {
      type: Object,
      default: undefined,
    },

    fetchPolicy: {
      type: String,
      default: undefined,
    },

    pollInterval: {
      type: Number,
      default: undefined,
    },

    notifyOnNetworkStatusChange: {
      type: Boolean,
      default: undefined,
    },

    context: {
      type: Object,
      default: undefined,
    },

    skip: {
      type: Boolean,
      default: false,
    },

    clientId: {
      type: String,
      default: undefined,
    },

    deep: {
      type: Boolean,
      default: undefined,
    },

    tag: {
      type: String,
      default: 'div',
    },
  },

  data () {
    return {
      result: {
        data: null,
        loading: false,
        networkStatus: 7,
        error: null,
        times: 0,
      },
    }
  },

  watch: {
    fetchPolicy (value) {
      this.$apollo.queries.query.setOptions({
        fetchPolicy: value,
      })
    },

    pollInterval (value) {
      this.$apollo.queries.query.setOptions({
        pollInterval: value,
      })
    },

    notifyOnNetworkStatusChange (value) {
      this.$apollo.queries.query.setOptions({
        notifyOnNetworkStatusChange: value,
      })
    },
  },

  apollo: {
    $client () {
      return this.clientId
    },

    query () {
      return {
        query () { return this.query },
        variables () { return this.variables },
        fetchPolicy: this.fetchPolicy,
        pollInterval: this.pollInterval,
        notifyOnNetworkStatusChange: this.notifyOnNetworkStatusChange,
        context () { return this.context },
        skip () { return this.skip },
        deep: this.deep,
        manual: true,
        result (result) {
          const { errors, loading, networkStatus } = result
          let { error } = result
          result = Object.assign({}, result)

          if (errors && errors.length) {
            error = new Error(`Apollo errors occured (${errors.length})`)
            error.graphQLErrors = errors
          }

          let data = {}

          if (loading) {
            Object.assign(data, this.$_previousData, result.data)
          } else if (error) {
            Object.assign(data, this.$apollo.queries.query.observer.getLastResult() || {}, result.data)
          } else {
            data = result.data
            this.$_previousData = result.data
          }

          this.result = {
            data: isDataFilled(data) ? data : undefined,
            loading,
            error,
            networkStatus,
            times: ++this.$_times,
          }

          this.$emit('result', this.result)
        },
        error (error) {
          this.result.loading = false
          this.result.error = error
          this.$emit('error', error)
        },
      }
    },
  },

  created () {
    this.$_times = 0
  },

  methods: {
    getDollarApollo () {
      return this.$apollo
    },

    getApolloQuery () {
      return this.$apollo.queries.query
    },
  },

  render (h) {
    let result = this.$scopedSlots.default({
      result: this.result,
      query: this.$apollo.queries.query,
      isLoading: this.$apolloData.loading,
    })
    if (Array.isArray(result)) {
      result = result.concat(this.$slots.default)
    } else {
      result = [result].concat(this.$slots.default)
    }
    return h(this.tag, result)
  },
}
