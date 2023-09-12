import gql from 'graphql-tag'
import { h } from 'vue'

function isDataFilled (data) {
  return data && Object.keys(data).length > 0
}

export default {
  name: 'ApolloQuery',

  provide () {
    return {
      getDollarApollo: this.getDollarApollo,
      getApolloQuery: this.getApolloQuery,
    }
  },

  emits: [ 'loading', 'result', 'error' ],

  props: {
    query: {
      type: [Function, Object],
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

    update: {
      type: Function,
      default: data => data,
    },

    skip: {
      type: Boolean,
      default: false,
    },

    debounce: {
      type: Number,
      default: 0,
    },

    throttle: {
      type: Number,
      default: 0,
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

    prefetch: {
      type: Boolean,
      default: true,
    },

    options: {
      type: Object,
      default: () => ({}),
    },
  },

  data () {
    return {
      result: {
        data: null,
        loading: false,
        networkStatus: 7,
        error: null,
      },
      times: 0,
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

    '$data.$apolloData.loading' (value) {
      this.$emit('loading', !!value)
    },
  },

  apollo: {
    $client () {
      return this.clientId
    },

    query () {
      return {
        query () {
          if (typeof this.query === 'function') {
            return this.query(gql)
          }
          return this.query
        },
        variables () { return this.variables },
        fetchPolicy: this.fetchPolicy,
        pollInterval: this.pollInterval,
        debounce: this.debounce,
        throttle: this.throttle,
        notifyOnNetworkStatusChange: this.notifyOnNetworkStatusChange,
        context () { return this.context },
        skip () { return this.skip },
        deep: this.deep,
        prefetch: this.prefetch,
        ...this.options,
        manual: true,
        result (result) {
          const { errors, loading, networkStatus } = result
          let { error } = result
          result = Object.assign({}, result)

          if (errors && errors.length) {
            error = new Error(`Apollo errors occurred (${errors.length})`)
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

          const dataNotEmpty = isDataFilled(data)

          this.result = {
            data: dataNotEmpty ? this.update(data) : undefined,
            fullData: dataNotEmpty ? data : undefined,
            loading,
            error,
            networkStatus,
          }

          this.times = ++this.$_times

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

  render () {
    const result = this.$slots.default({
      result: this.result,
      times: this.times,
      query: this.$apollo.queries.query,
      isLoading: this.$apolloData.loading,
      gqlError: this.result && this.result.error && this.result.error.gqlError,
    })
    return this.tag ? h(this.tag, result) : result
  },
}
