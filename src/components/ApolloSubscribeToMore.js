let uid = 0

export default {
  name: 'ApolloSubscribeToMore',

  inject: [
    'getDollarApollo',
    'getApolloQuery',
  ],

  props: {
    document: {
      type: Object,
      required: true,
    },

    variables: {
      type: Object,
      default: null,
    },

    updateQuery: {
      type: Function,
      default: null,
    },
  },

  watch: {
    document: 'refresh',
    variables: 'refresh',
  },

  created () {
    this.$_key = `sub_component_${uid++}`
  },

  mounted () {
    this.refresh()
  },

  beforeDestroy () {
    this.destroy()
  },

  methods: {
    destroy () {
      if (this.$_sub) {
        this.$_sub.destroy()
      }
    },

    refresh () {
      this.destroy()

      this.$_sub = this.getDollarApollo().addSmartSubscription(this.$_key, {
        document: this.document,
        variables: this.variables,
        updateQuery: this.updateQuery,
        linkedQuery: this.getApolloQuery(),
      })
    },
  },

  render (h) {
    return null
  },
}
