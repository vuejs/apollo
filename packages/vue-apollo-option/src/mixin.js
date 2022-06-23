import { reapply } from '../lib/utils'
import { DollarApollo } from './dollar-apollo'
import { isServer } from './env'

function hasProperty (holder, key) {
  return typeof holder !== 'undefined' && Object.prototype.hasOwnProperty.call(holder, key)
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
    for (const key in apollo) {
      if (key.charAt(0) !== '$') {
        let options = apollo[key]
        const smart = this.$apollo.addSmartQuery(key, options)
        if (isServer) {
          options = reapply(options, this)
          if (apolloProvider.prefetch !== false && options.prefetch !== false && apollo.$prefetch !== false && !smart.skip) {
            this.$_apolloPromises.push(smart.firstRun)
          }
        }
      }
    }

    if (apollo.subscribe) {
      console.warn('vue-apollo -> `subscribe` option is deprecated. Use the `$subscribe` option instead.')
    }

    if (apollo.$subscribe) {
      for (const key in apollo.$subscribe) {
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
  if (this.$apollo) {
    this.$apollo.destroy()
    this.$apollo = null
  }
}

export function installMixin (app, provider) {
  app.mixin({
    data () {
      const result = {
        $apolloData: {
          queries: {},
          loading: 0,
          data: {},
        },
      }
      // Init data props
      const apollo = this.$options.apollo
      if (apollo) {
        for (const key in apollo) {
          if (key.charAt(0) !== '$') {
            const options = apollo[key]
            if (!options.manual && !hasProperty(this.$options.props, key) && !hasProperty(this.$options.computed, key) && !hasProperty(this.$options.methods, key)) {
              result[key] = null
            }
          }
        }
      }
      return result
    },

    beforeCreate () {
      this.$apollo = new DollarApollo(this, provider)
      if (isServer) {
        // Patch render function to cleanup apollo
        const render = this.$options.render
        this.$options.render = (h) => {
          const result = render.call(this, h)
          destroy.call(this)
          return result
        }
      }
    },

    serverPrefetch () {
      if (this.$_apolloPromises) {
        return Promise.all(this.$_apolloPromises).then(() => {
          destroy.call(this)
        }).catch(e => {
          destroy.call(this)
          return Promise.reject(e)
        })
      }
    },

    created: launch,

    unmounted: destroy,
  })
}
