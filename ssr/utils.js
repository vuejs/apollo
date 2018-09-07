const { noop } = require('../lib/utils')

const computedPropDef = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop,
}

exports.defineComputed = function (target, key, userDef) {
  if (typeof userDef === 'function') {
    computedPropDef.get = userDef
    computedPropDef.set = noop
  } else {
    computedPropDef.get = userDef.get || noop
    computedPropDef.set = userDef.set || noop
  }
  Object.defineProperty(target, key, computedPropDef)
}

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

exports.resolveAsset = function (assets, id) {
  if (typeof id !== 'string') return

  if (hasOwn(assets, id)) return assets[id]

  const camelCaseId = camelize(id)
  if (hasOwn(assets, camelCaseId)) return assets[camelCaseId]

  const pascalCaseId = capitalize(camelCaseId)
  if (hasOwn(assets, pascalCaseId)) return assets[pascalCaseId]
}
