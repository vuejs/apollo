import { Globals, reapply } from '../lib/utils'

function hasProperty (holder, key) {
  return typeof holder !== 'undefined' && Object.prototype.hasOwnProperty.call(holder, key)
}

function initProvider () {
  const options = this.$options
  // ApolloProvider injection
  const optionValue = options.apolloProvider
  if (optionValue) {
    this.$apolloProvider = typeof optionValue === 'function'
      ? optionValue()
      : optionValue
  } else if (options.parent && options.parent.$apolloProvider) {
    this.$apolloProvider = options.parent.$apolloProvider
  } else if (options.provide) {
    // TODO remove
    // Temporary retro-compatibility
    const provided = typeof options.provide === 'function'
      ? options.provide.call(this)
      : options.provide
    if (provided && provided.$apolloProvider) {
      this.$apolloProvider = provided.$apolloProvider
    }
  }
}

function proxyData () {
  this.$_apolloInitData = {}

  let apollo = this.$options.apollo
  if (apollo) {
    // watchQuery
    for (let key in apollo) {
      if (key.charAt(0) !== '$') {
        let options = apollo[key]
        // Property proxy
        if (!options.manual && !hasProperty(this.$options.props, key) && !hasProperty(this.$options.computed, key) && !hasProperty(this.$options.methods, key)) {
          Object.defineProperty(this, key, {
            get: () => this.$data.$apolloData.data[key],
            // For component class constructor
            set: value => this.$_apolloInitData[key] = value,
            enumerable: true,
            configurable: true,
          })
        }
      }
    }
  }
}

function launch () {
  const apolloProvider = this.$apolloProvider

  if (this._apolloLaunched || !apolloProvider) return
  this._apolloLaunched = true

  // Prepare properties
  let apollo = this.$options.apollo

  if (apollo) {
    this.$_apolloPromises = []

    if (!apollo.$init) {
      apollo.$init = true

      // Default options applied to `apollo` options
      if (apolloProvider.defaultOptions) {
        apollo = this.$options.apollo = Object.assign({}, apolloProvider.defaultOptions, apollo)
      }
    }

    defineReactiveSetter(this.$apollo, 'skipAll', apollo.$skipAll, apollo.$deep)
    defineReactiveSetter(this.$apollo, 'skipAllQueries', apollo.$skipAllQueries, apollo.$deep)
    defineReactiveSetter(this.$apollo, 'skipAllSubscriptions', apollo.$skipAllSubscriptions, apollo.$deep)
    defineReactiveSetter(this.$apollo, 'client', apollo.$client, apollo.$deep)
    defineReactiveSetter(this.$apollo, 'loadingKey', apollo.$loadingKey, apollo.$deep)
    defineReactiveSetter(this.$apollo, 'error', apollo.$error, apollo.$deep)
    defineReactiveSetter(this.$apollo, 'watchLoading', apollo.$watchLoading, apollo.$deep)

    // Apollo Data
    Object.defineProperty(this, '$apolloData', {
      get: () => this.$data.$apolloData,
      enumerable: true,
      configurable: true,
    })

    // watchQuery
    for (let key in apollo) {
      if (key.charAt(0) !== '$') {
        let options = apollo[key]
        const smart = this.$apollo.addSmartQuery(key, options)
        if (this.$isServer) {
          options = reapply(options, this)
          if (apolloProvider.prefetch !== false && options.prefetch !== false && apollo.$prefetch !== false && !smart.skip) {
            this.$_apolloPromises.push(smart.firstRun)
          }
        }
      }
    }

    if (apollo.subscribe) {
      Globals.Vue.util.warn('vue-apollo -> `subscribe` option is deprecated. Use the `$subscribe` option instead.')
    }

    if (apollo.$subscribe) {
      for (let key in apollo.$subscribe) {
        this.$apollo.addSmartSubscription(key, apollo.$subscribe[key])
      }
    }
  }
}

function defineReactiveSetter ($apollo, key, value, deep) {
  if (typeof value !== 'undefined') {
    if (typeof value === 'function') {
      $apollo.defineReactiveSetter(key, value, deep)
    } else {
      $apollo[key] = value
    }
  }
}

function destroy () {
  if (this.$_apollo) {
    this.$_apollo.destroy()
    this.$_apollo = null
  }
}

export function installMixin (Vue, vueVersion) {
  Vue.mixin({
    ...vueVersion === '1' ? {
      init: initProvider,
    } : {},

    ...vueVersion === '2' ? {
      data () {
        return {
          '$apolloData': {
            queries: {},
            loading: 0,
            data: this.$_apolloInitData,
          },
        }
      },

      beforeCreate () {
        initProvider.call(this)
        proxyData.call(this)
      },

      serverPrefetch () {
        if (this.$_apolloPromises) {
          return Promise.all(this.$_apolloPromises).then(result => {
            // Destroy DollarApollo after SSR promises are resolved
            destroy.call(this)
            return result
          })
        }
      },
    } : {},

    created: launch,

    destroyed: destroy,
  })
}
