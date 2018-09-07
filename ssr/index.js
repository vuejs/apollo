const chalk = require('chalk')
const { VUE_APOLLO_QUERY_KEYWORDS } = require('../lib/consts')
const { createFakeInstance, resolveComponent } = require('./utils')
const { Globals, getMergedDefinition, omit } = require('../lib/utils')

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
    components.map(component => walkTree(component, {}, undefined, [], context, queries, components))
  ).then(() => queries)
}

function walkTree (component, data, parent, children, context, queries, components) {
  component = getMergedDefinition(component)
  return new Promise((resolve, reject) => {
    const queue = []
    data = data || {}
    const vm = createFakeInstance(component, data, parent, children, context)
    vm.$createElement = (el, data, children) => {
      if (typeof data === 'string' || Array.isArray(data)) {
        children = data
        data = {}
      }

      // No Prefetch flag
      if (data && data.attrs &&
          data.attrs['no-prefetch'] !== undefined &&
          data.attrs['no-prefetch'] !== false) {
        return
      }

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
          options.prefetch !== false
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
        } else if (prefetchType === 'boolean') {
          if (prefetchResult === false) {
            return Promise.resolve()
          }
        } else {
          prefetchResult = prefetch
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
