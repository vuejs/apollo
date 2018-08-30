const chalk = require('chalk')
const { VUE_APOLLO_QUERY_KEYWORDS } = require('../lib/consts')
const { VM_HELPERS, COMPONENT_BLACKLIST } = require('./consts')
const { Globals, getMergedDefinition, omit, noop } = require('../lib/utils')

exports.install = function (Vue) {
  Globals.Vue = Vue
}

exports.prefetchAll = function (apolloProvider, components, context) {
  return exports.getQueriesFromTree(components, context)
    .then(queries => Promise.all(queries.map(
      query => prefetchQuery(apolloProvider, query, context)
    )))
}

exports.getQueriesFromTree = function (components, context) {
  const queries = []
  return Promise.all(
    components.map(component => walkTree(component, {}, {}, [], context, queries, components))
  ).then(() => queries)
}

function walkTree (component, data, parent, children, context, queries, components) {
  component = getMergedDefinition(component)
  return new Promise((resolve, reject) => {
    const queue = []
    const vm = createFakeInstance(component, data, parent, children, context)
    vm.$createElement = (el, data, children) => {
      if (typeof data === 'string' || Array.isArray(data)) {
        children = data
        data = {}
      }

      // No Prefetch flag
      if (data && data.attrs && data.attrs['no-prefetch']) return

      queue.push(resolveComponent(el, component).then(resolvedComponent => {
        let child
        if (resolvedComponent && !components.includes(resolvedComponent)) {
          child = {
            component: resolvedComponent,
            data,
            children,
          }
        }
        return child
      }))
    }

    prefetchComponent(component, vm, queries)

    try {
      component.render.call(vm, vm.$createElement)
    } catch (e) {
      console.log(chalk.red(`Error while rendering ${component.name || component.__file}`))
      console.log(e.stack)
    }

    Promise.all(queue).then(queue => queue.filter(child => !!child).map(
      child => walkTree(child.component, child.data, vm, child.children, context, queries, components)
    )).then(() => resolve())
  })
}

function prefetchComponent (component, vm, queries) {
  const apolloOptions = component.apollo

  if (!apolloOptions) return
  if (apolloOptions.$prefetch === false) return

  const componentClient = apolloOptions.$client
  for (let key in apolloOptions) {
    const options = apolloOptions[key]
    if (
      key.charAt(0) !== '$' && (
        !options.query || (
          (typeof options.ssr === 'undefined' || options.ssr) &&
          (typeof options.prefetch !== 'undefined' && options.prefetch)
        )
      )
    ) {
      queries.push({
        queryOptions: options,
        client: options.client || componentClient,
        vm,
      })
    }
  }
}

function createFakeInstance (options, data, parent, children, context) {
  const vm = {
    ...data.attrs,
    ...data.props,
    $parent: parent,
    $children: children,
    $slots: {},
    $scopedSlots: {},
    $set: Globals.Vue.set,
    $delete: Globals.Vue.delete,
    $route: context.route,
    $store: context.store,
    $apollo: {
      queries: {},
      loading: false,
    },
    $apolloData: {
      loading: false,
    },
    _self: {},
    _staticTrees: [],
    _u: resolveScopedSlots,
  }

  // Render and other helpers
  VM_HELPERS.forEach(helper => vm[helper] = noop)

  // Scoped slots
  if (data.scopedSlots) {
    vm.$scopedSlots = data.scopedSlots
  }

  // Route props
  if (context && context.route) {
    const { route } = context
    const matchedRoute = findRouteMatch(options, route)
    if (matchedRoute && matchedRoute.props) {
      const { props } = matchedRoute
      if (props === true) {
        Object.assign(vm, matchedRoute.params)
      } else if (typeof props === 'function') {
        Object.assign(vm, props(matchedRoute))
      } else if (typeof props === 'object') {
        Object.assign(vm, props)
      }
    }
  }

  // Data
  const localData = options.data
  if (typeof localData === 'function') {
    Object.assign(vm, localData(vm))
  } else if (typeof localData === 'object') {
    Object.assign(vm, localData)
  }

  // Prefetch state
  const prefetch = options.prefetch
  if (typeof prefetch === 'function') {
    Object.assign(vm, prefetch(context))
  } else if (typeof prefetch === 'object') {
    Object.assign(vm, prefetch)
  }

  return vm
}

function findRouteMatch (component, route) {
  for (const r of route.matched) {
    for (const key in r.components) {
      if (r.components[key] === component) {
        return r
      }
    }
  }
}

function resolveComponent (name, options) {
  return new Promise((resolve) => {
    if (options.components) {
      if (options.components[name]) {
        return resolve(options.components[name])
      }
    }
    return resolve(Globals.Vue.options.components[name])
  }).then(component => {
    if (component) {
      component = getMergedDefinition(component)
      if (!component.functional && (
        !component.name ||
        !COMPONENT_BLACKLIST.includes(component.name)
      )) {
        return component
      }
    }
  })
}

function resolveScopedSlots (fns, res) {
  res = res || {}
  for (var i = 0; i < fns.length; i++) {
    if (Array.isArray(fns[i])) {
      resolveScopedSlots(fns[i], res)
    } else {
      res[fns[i].key] = fns[i].fn
    }
  }
  return res
}

function prefetchQuery (apolloProvider, query, context) {
  try {
    let variables

    let { queryOptions, client, vm } = query

    // Client
    if (typeof client === 'function') {
      client = client.call(vm)
    }
    if (!client) {
      client = apolloProvider.defaultClient
    } else if (typeof client === 'string') {
      client = apolloProvider.clients[client]
      if (!client) {
        throw new Error(`[vue-apollo] Missing client '${client}' in 'apolloProvider'`)
      }
    }

    // Function query
    if (typeof queryOptions === 'function') {
      queryOptions = queryOptions.call(vm)
    }

    // Simple query
    if (!queryOptions.query) {
      queryOptions = {
        query: queryOptions,
      }
    } else {
      const prefetch = queryOptions.prefetch
      const prefetchType = typeof prefetch

      // Resolve variables
      let prefetchResult
      if (prefetchType !== 'undefined') {
        if (prefetchType === 'function') {
          prefetchResult = prefetch.call(vm, context)
        } else {
          prefetchResult = prefetch
        }

        if (prefetchType === 'boolean' && prefetchResult === false) {
          return Promise.resolve()
        }
      }

      if (prefetchResult) {
        variables = prefetchResult
      } else {
        const optVariables = queryOptions.variables
        if (typeof optVariables !== 'undefined') {
          // Reuse `variables` option with `prefetch: true`
          if (typeof optVariables === 'function') {
            variables = optVariables.call(vm)
          } else {
            variables = optVariables
          }
        } else {
          variables = undefined
        }
      }
    }

    // Query
    if (typeof queryOptions.query === 'function') {
      queryOptions.query = queryOptions.query.call(vm)
    }

    const options = omit(queryOptions, [
      ...VUE_APOLLO_QUERY_KEYWORDS,
      'fetchPolicy',
    ])
    options.variables = variables
    options.fetchPolicy = 'network-only'

    return client.query(options)
  } catch (e) {
    console.log(e.stack)
  }
}

exports.getStates = function (apolloProvider, options) {
  const finalOptions = Object.assign({}, {
    exportNamespace: '',
  }, options)
  const states = {}
  for (const key in apolloProvider.clients) {
    const client = apolloProvider.clients[key]
    const state = client.cache.extract()
    states[`${finalOptions.exportNamespace}${key}`] = state
  }
  return states
}

exports.exportStates = function (apolloProvider, options) {
  const finalOptions = Object.assign({}, {
    globalName: '__APOLLO_STATE__',
    attachTo: 'window',
  }, options)
  const states = exports.getStates(apolloProvider, finalOptions)
  const js = `${finalOptions.attachTo}.${finalOptions.globalName} = ${JSON.stringify(states)};`
  return js
}
