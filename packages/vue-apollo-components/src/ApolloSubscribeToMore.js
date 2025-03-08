import gql from 'graphql-tag'

let uid = 0

export default {
  name: 'ApolloSubscribeToMore',

  inject: [
    'getDollarApollo',
    'getApolloQuery',
  ],

  props: {
    document: {
      type: [Function, Object],
      required: true,
    },

    variables: {
      type: Object,
      default: undefined,
    },

    updateQuery: {
      type: Function,
      default: undefined,
    },
  },

  watch: {
    document: 'refresh',
    variables: 'refresh',
  },

  created() {
    this.$_key = `sub_component_${uid++}`
  },

  mounted() {
    this.refresh()
  },

  beforeUnmount() {
    this.destroy()
  },

  methods: {
    destroy() {
      if (this.$_sub) {
        this.$_sub.destroy()
      }
    },

    refresh() {
      this.destroy()

      let document = this.document
      if (typeof document === 'function') {
        document = document(gql)
      }

      this.$_sub = this.getDollarApollo().addSmartSubscription(this.$_key, {
        document,
        variables: this.variables,
        updateQuery: this.updateQuery,
        linkedQuery: this.getApolloQuery(),
      })
    },
  },

  render() {
    return null
  },
}
