const { VM_HELPERS, SSR_HELPERS, COMPONENT_BLACKLIST } = require('./consts')
const { Globals, getMergedDefinition, noop } = require('../lib/utils')

/* Fake instance creation */

function emptyString () {
  return ''
}

const computedPropDef = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop,
}

function defineComputed (target, key, userDef) {
  if (typeof userDef === 'function') {
    computedPropDef.get = userDef
    computedPropDef.set = noop
  } else {
    computedPropDef.get = userDef.get || noop
    computedPropDef.set = userDef.set || noop
  }
  Object.defineProperty(target, key, computedPropDef)
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

function findRouteMatch (component, route) {
  for (const r of route.matched) {
    for (const key in r.components) {
      if (r.components[key] === component) {
        return r
      }
    }
  }
}

exports.createFakeInstance = function (options, data, parent, children, context) {
  const vm = Object.assign(
    {},
    data.attrs,
    data.props,
    {
      $prefetch: true,
      $parent: parent,
      $children: children,
      $attrs: data.attrs,
      $props: data.props,
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
  )

  // Render and other helpers
  VM_HELPERS.forEach(helper => vm[helper] = noop)
  SSR_HELPERS.forEach(helper => vm[helper] = emptyString)

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

  // Methods
  const methods = options.methods
  for (const key in methods) {
    vm[key] = methods[key].bind(vm)
  }

  // Computed
  const computed = options.computed
  for (const key in computed) {
    defineComputed(vm, key, computed[key])
  }

  // Data
  const localData = options.data
  if (typeof localData === 'function') {
    vm._data = localData.call(vm, vm)
  } else if (typeof localData === 'object') {
    vm._data = localData
  } else {
    vm._data = {}
  }
  vm.$data = vm._data
  Object.assign(vm, vm._data)

  // Prefetch state
  const prefetch = options.prefetch
  if (typeof prefetch === 'function') {
    Object.assign(vm, prefetch(context))
  } else if (typeof prefetch === 'object') {
    Object.assign(vm, prefetch)
  }

  return vm
}

/* Component resolution */

function cached (fn) {
  const cache = Object.create(null)
  return function cachedFn (str) {
    const hit = cache[str]
    return hit || (cache[str] = fn(str))
  }
}

const camelizeRE = /-(\w)/g
const camelize = cached(function (str) {
  return str.replace(camelizeRE, function (_, c) { return c ? c.toUpperCase() : '' })
})

const capitalize = cached(function (str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
})

const hasOwnProperty = Object.prototype.hasOwnProperty
function hasOwn (obj, key) {
  return hasOwnProperty.call(obj, key)
}

function resolveAsset (assets, id) {
  if (typeof id !== 'string') return

  if (hasOwn(assets, id)) return assets[id]

  const camelCaseId = camelize(id)
  if (hasOwn(assets, camelCaseId)) return assets[camelCaseId]

  const pascalCaseId = capitalize(camelCaseId)
  if (hasOwn(assets, pascalCaseId)) return assets[pascalCaseId]
}

exports.resolveComponent = function (name, options) {
  return new Promise((resolve) => {
    if (options.components) {
      const component = resolveAsset(options.components, name)
      if (component !== undefined) {
        resolve(component)
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
