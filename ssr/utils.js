const { noop } = require('../lib/utils')

function cached (fn) {
  var cache = Object.create(null);
  return (function cachedFn (str) {
    var hit = cache[str];
    return hit || (cache[str] = fn(str))
  })
}

const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
}

const camelizeRE = /-(\w)/g;
const camelize = cached(function (str) {
  return str.replace(camelizeRE, function (_, c) { return c ? c.toUpperCase() : ''; })
});

const capitalize = cached(function (str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
});

const hasOwnProperty = Object.prototype.hasOwnProperty;
function hasOwn (obj, key) {
  return hasOwnProperty.call(obj, key)
}

exports.resolveAsset = function (options, type, id) {
  if (typeof id !== 'string') {
    return
  }
  var assets = options[type];
  if (hasOwn(assets, id)) { return assets[id] }
  var camelizedId = camelize(id);
  if (hasOwn(assets, camelizedId)) { return assets[camelizedId] }
  var PascalCaseId = capitalize(camelizedId);
  if (hasOwn(assets, PascalCaseId)) { return assets[PascalCaseId] }
  var res = assets[id] || assets[camelizedId] || assets[PascalCaseId];
  return res
}

exports.defineComputed = function (target, key, userDef) {
  if (typeof userDef === 'function') {
    sharedPropertyDefinition.get = userDef
    sharedPropertyDefinition.set = noop
  } else {
    sharedPropertyDefinition.get = userDef.get ? userDef.get : noop
    sharedPropertyDefinition.set = userDef.set ? userDef.set : noop
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}
