(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('throttle-debounce/throttle'), require('throttle-debounce/debounce')) :
	typeof define === 'function' && define.amd ? define(['exports', 'throttle-debounce/throttle', 'throttle-debounce/debounce'], factory) :
	(factory((global['vue-apollo'] = {}),global.oThrottle,global.oDebounce));
}(this, (function (exports,oThrottle,oDebounce) { 'use strict';

oThrottle = oThrottle && oThrottle.hasOwnProperty('default') ? oThrottle['default'] : oThrottle;
oDebounce = oDebounce && oDebounce.hasOwnProperty('default') ? oDebounce['default'] : oDebounce;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};









var asyncToGenerator = function (fn) {
  return function () {
    var gen = fn.apply(this, arguments);
    return new Promise(function (resolve, reject) {
      function step(key, arg) {
        try {
          var info = gen[key](arg);
          var value = info.value;
        } catch (error) {
          reject(error);
          return;
        }

        if (info.done) {
          resolve(value);
        } else {
          return Promise.resolve(value).then(function (value) {
            step("next", value);
          }, function (err) {
            step("throw", err);
          });
        }
      }

      return step("next");
    });
  };
};

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();





var defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

var get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};





var slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();













var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

var Globals = {};

function factory(action) {
  return function (cb, time) {
    return action(time, cb);
  };
}

var throttle = factory(oThrottle);

var debounce = factory(oDebounce);

function getMergedDefinition(def) {
  return Globals.Vue.util.mergeOptions({}, def);
}

function reapply(options, context) {
  while (typeof options === 'function') {
    options = options.call(context);
  }
  return options;
}

function omit(obj, properties) {
  return Object.entries(obj).filter(function (_ref) {
    var _ref2 = slicedToArray(_ref, 1),
        key = _ref2[0];

    return !properties.includes(key);
  }).reduce(function (c, _ref3) {
    var _ref4 = slicedToArray(_ref3, 2),
        key = _ref4[0],
        val = _ref4[1];

    c[key] = val;
    return c;
  }, {});
}

var SmartApollo = function () {
  function SmartApollo(vm, key, options) {
    var autostart = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
    classCallCheck(this, SmartApollo);
    this.type = null;
    this.vueApolloSpecialKeys = [];

    this.vm = vm;
    this.key = key;
    this.initialOptions = options;
    this.options = Object.assign({}, options);
    this._skip = false;
    this._watchers = [];
    this._destroyed = false;

    if (this.vm.$isServer) {
      this.options.fetchPolicy = 'cache-first';
    }

    if (autostart) {
      this.autostart();
    }
  }

  createClass(SmartApollo, [{
    key: 'autostart',
    value: function autostart() {
      if (typeof this.options.skip === 'function') {
        this._skipWatcher = this.vm.$watch(this.options.skip.bind(this.vm), this.skipChanged.bind(this), {
          immediate: true,
          deep: this.options.deep
        });
      } else if (!this.options.skip) {
        this.start();
      } else {
        this._skip = true;
      }
    }
  }, {
    key: 'skipChanged',
    value: function skipChanged(value, oldValue) {
      if (value !== oldValue) {
        this.skip = value;
      }
    }
  }, {
    key: 'refresh',
    value: function refresh() {
      if (!this._skip) {
        this.stop();
        this.start();
      }
    }
  }, {
    key: 'start',
    value: function start() {
      var _this = this;

      this.starting = true;

      // Query callback
      if (typeof this.initialOptions.query === 'function') {
        var queryCb = this.initialOptions.query.bind(this.vm);
        this.options.query = queryCb();
        this._watchers.push(this.vm.$watch(queryCb, function (query) {
          _this.options.query = query;
          _this.refresh();
        }, {
          deep: this.options.deep
        }));
      }
      // Query callback
      if (typeof this.initialOptions.document === 'function') {
        var _queryCb = this.initialOptions.document.bind(this.vm);
        this.options.document = _queryCb();
        this._watchers.push(this.vm.$watch(_queryCb, function (document) {
          _this.options.document = document;
          _this.refresh();
        }, {
          deep: this.options.deep
        }));
      }

      // Apollo context
      if (typeof this.initialOptions.context === 'function') {
        var cb = this.initialOptions.context.bind(this.vm);
        this.options.context = cb();
        this._watchers.push(this.vm.$watch(cb, function (context) {
          _this.options.context = context;
          _this.refresh();
        }, {
          deep: this.options.deep
        }));
      }

      // GraphQL Variables
      if (typeof this.options.variables === 'function') {
        var _cb = this.executeApollo.bind(this);
        _cb = this.options.throttle ? throttle(_cb, this.options.throttle) : _cb;
        _cb = this.options.debounce ? debounce(_cb, this.options.debounce) : _cb;
        this._watchers.push(this.vm.$watch(function () {
          return _this.options.variables.call(_this.vm);
        }, _cb, {
          immediate: true,
          deep: this.options.deep
        }));
      } else {
        this.executeApollo(this.options.variables);
      }
    }
  }, {
    key: 'stop',
    value: function stop() {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this._watchers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var unwatch = _step.value;

          unwatch();
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      if (this.sub) {
        this.sub.unsubscribe();
        this.sub = null;
      }
    }
  }, {
    key: 'generateApolloOptions',
    value: function generateApolloOptions(variables) {
      var apolloOptions = omit(this.options, this.vueApolloSpecialKeys);
      apolloOptions.variables = variables;
      return apolloOptions;
    }
  }, {
    key: 'executeApollo',
    value: function executeApollo(variables) {
      this.starting = false;
    }
  }, {
    key: 'nextResult',
    value: function nextResult() {
      throw new Error('Not implemented');
    }
  }, {
    key: 'callHandlers',
    value: function callHandlers(handlers) {
      var catched = false;

      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = handlers[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var handler = _step2.value;

          if (handler) {
            catched = true;
            var result = handler.apply(this.vm, args);
            if (typeof result !== 'undefined' && !result) {
              break;
            }
          }
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      return catched;
    }
  }, {
    key: 'errorHandler',
    value: function errorHandler() {
      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      return this.callHandlers.apply(this, [[this.options.error, this.vm.$apollo.error, this.vm.$apollo.provider.errorHandler]].concat(args));
    }
  }, {
    key: 'catchError',
    value: function catchError(error) {
      var catched = this.errorHandler(error);

      if (catched) return;

      if (error.graphQLErrors && error.graphQLErrors.length !== 0) {
        console.error('GraphQL execution errors for ' + this.type + ' \'' + this.key + '\'');
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = error.graphQLErrors[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var e = _step3.value;

            console.error(e);
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3.return) {
              _iterator3.return();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }
      } else if (error.networkError) {
        console.error('Error sending the ' + this.type + ' \'' + this.key + '\'', error.networkError);
      } else {
        console.error('[vue-apollo] An error has occured for ' + this.type + ' \'' + this.key + '\'');
        if (Array.isArray(error)) {
          var _console;

          (_console = console).error.apply(_console, toConsumableArray(error));
        } else {
          console.error(error);
        }
      }
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      if (this._destroyed) return;

      this._destroyed = true;
      this.stop();
      if (this._skipWatcher) {
        this._skipWatcher();
      }
    }
  }, {
    key: 'skip',
    get: function get$$1() {
      return this._skip;
    },
    set: function set$$1(value) {
      if (value) {
        this.stop();
      } else {
        this.start();
      }
      this._skip = value;
    }
  }]);
  return SmartApollo;
}();

var VUE_APOLLO_QUERY_KEYWORDS = ['variables', 'watch', 'update', 'result', 'error', 'loadingKey', 'watchLoading', 'skip', 'throttle', 'debounce', 'subscribeToMore', 'prefetch', 'manual'];

var SmartQuery = function (_SmartApollo) {
  inherits(SmartQuery, _SmartApollo);

  function SmartQuery(vm, key, options) {
    var autostart = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
    classCallCheck(this, SmartQuery);

    // Simple query
    if (!options.query) {
      var query = options;
      options = {
        query: query
      };
    }

    // Add reactive data related to the query
    if (vm.$data.$apolloData && !vm.$data.$apolloData.queries[key]) {
      vm.$set(vm.$data.$apolloData.queries, key, {
        loading: false
      });
    }

    var _this = possibleConstructorReturn(this, (SmartQuery.__proto__ || Object.getPrototypeOf(SmartQuery)).call(this, vm, key, options, autostart));

    _this.type = 'query';
    _this.vueApolloSpecialKeys = VUE_APOLLO_QUERY_KEYWORDS;
    _this._loading = false;


    if (!options.manual) {
      _this.hasDataField = _this.vm.$data.hasOwnProperty(key);
      if (_this.hasDataField) {
        Object.defineProperty(_this.vm.$data.$apolloData.data, key, {
          get: function get$$1() {
            return _this.vm.$data[key];
          },
          enumerable: true,
          configurable: true
        });
      } else {
        Object.defineProperty(_this.vm.$data, key, {
          get: function get$$1() {
            return _this.vm.$data.$apolloData.data[key];
          },
          enumerable: true,
          configurable: true
        });
      }
    }
    return _this;
  }

  createClass(SmartQuery, [{
    key: 'stop',
    value: function stop() {
      get(SmartQuery.prototype.__proto__ || Object.getPrototypeOf(SmartQuery.prototype), 'stop', this).call(this);

      if (this.observer) {
        this.observer.stopPolling();
        this.observer = null;
      }
    }
  }, {
    key: 'executeApollo',
    value: function executeApollo(variables) {
      if (this.observer) {
        // Update variables
        // Don't use setVariables directly or it will ignore cache
        this.observer.setOptions(this.generateApolloOptions(variables));
      } else {
        if (this.sub) {
          this.sub.unsubscribe();
        }

        // Create observer
        this.observer = this.vm.$apollo.watchQuery(this.generateApolloOptions(variables));

        // Create subscription
        this.sub = this.observer.subscribe({
          next: this.nextResult.bind(this),
          error: this.catchError.bind(this)
        });
      }

      if (this.options.fetchPolicy !== 'no-cache') {
        var currentResult = this.maySetLoading();

        if (!currentResult.loading) {
          this.nextResult(currentResult);
        }
      }

      get(SmartQuery.prototype.__proto__ || Object.getPrototypeOf(SmartQuery.prototype), 'executeApollo', this).call(this, variables);
    }
  }, {
    key: 'maySetLoading',
    value: function maySetLoading() {
      var force = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      var currentResult = this.observer.currentResult();
      if (force || currentResult.loading) {
        if (!this.loading) {
          this.applyLoadingModifier(1);
        }
        this.loading = true;
      }
      return currentResult;
    }
  }, {
    key: 'nextResult',
    value: function nextResult(result) {
      var data = result.data,
          loading = result.loading;


      if (!loading) {
        this.loadingDone();
      }

      var hasResultCallback = typeof this.options.result === 'function';

      if (typeof data === 'undefined') {
        // No result
      } else if (!this.options.manual) {
        if (typeof this.options.update === 'function') {
          this.setData(this.options.update.call(this.vm, data));
        } else if (data[this.key] === undefined) {
          console.error('Missing ' + this.key + ' attribute on result', data);
        } else {
          this.setData(data[this.key]);
        }
      } else if (!hasResultCallback) {
        console.error(this.key + ' query must have a \'result\' hook in manual mode');
      }

      if (hasResultCallback) {
        this.options.result.call(this.vm, result);
      }
    }
  }, {
    key: 'setData',
    value: function setData(value) {
      this.vm.$set(this.hasDataField ? this.vm.$data : this.vm.$data.$apolloData.data, this.key, value);
    }
  }, {
    key: 'catchError',
    value: function catchError(error) {
      get(SmartQuery.prototype.__proto__ || Object.getPrototypeOf(SmartQuery.prototype), 'catchError', this).call(this, error);
      this.loadingDone();
    }
  }, {
    key: 'watchLoading',
    value: function watchLoading() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return this.callHandlers.apply(this, [[this.options.watchLoading, this.vm.$apollo.watchLoading, this.vm.$apollo.provider.watchLoading]].concat(args));
    }
  }, {
    key: 'applyLoadingModifier',
    value: function applyLoadingModifier(value) {
      var loadingKey = this.loadingKey;
      if (loadingKey && typeof this.vm[loadingKey] === 'number') {
        this.vm[loadingKey] += value;
      }

      this.watchLoading(value === 1, value);
    }
  }, {
    key: 'loadingDone',
    value: function loadingDone() {
      if (this.loading) {
        this.applyLoadingModifier(-1);
      }
      this.loading = false;
    }
  }, {
    key: 'fetchMore',
    value: function fetchMore() {
      var _this2 = this;

      if (this.observer) {
        var _observer;

        this.maySetLoading(true);
        return (_observer = this.observer).fetchMore.apply(_observer, arguments).then(function (result) {
          if (!result.loading) {
            _this2.loadingDone();
          }
          return result;
        });
      }
    }
  }, {
    key: 'subscribeToMore',
    value: function subscribeToMore() {
      if (this.observer) {
        var _observer2;

        return {
          unsubscribe: (_observer2 = this.observer).subscribeToMore.apply(_observer2, arguments)
        };
      }
    }
  }, {
    key: 'refetch',
    value: function refetch(variables) {
      var _this3 = this;

      variables && (this.options.variables = variables);
      if (this.observer) {
        var result = this.observer.refetch(variables).then(function (result) {
          if (!result.loading) {
            _this3.loadingDone();
          }
          return result;
        });
        this.maySetLoading();
        return result;
      }
    }
  }, {
    key: 'setVariables',
    value: function setVariables(variables, tryFetch) {
      this.options.variables = variables;
      if (this.observer) {
        var result = this.observer.setVariables(variables, tryFetch);
        this.maySetLoading();
        return result;
      }
    }
  }, {
    key: 'setOptions',
    value: function setOptions(options) {
      Object.assign(this.options, options);
      if (this.observer) {
        var result = this.observer.setOptions(options);
        this.maySetLoading();
        return result;
      }
    }
  }, {
    key: 'startPolling',
    value: function startPolling() {
      if (this.observer) {
        var _observer3;

        return (_observer3 = this.observer).startPolling.apply(_observer3, arguments);
      }
    }
  }, {
    key: 'stopPolling',
    value: function stopPolling() {
      if (this.observer) {
        var _observer4;

        return (_observer4 = this.observer).stopPolling.apply(_observer4, arguments);
      }
    }
  }, {
    key: 'client',
    get: function get$$1() {
      return this.vm.$apollo.getClient(this.options);
    }
  }, {
    key: 'loading',
    get: function get$$1() {
      return this.vm.$data.$apolloData && this.vm.$data.$apolloData.queries[this.key] ? this.vm.$data.$apolloData.queries[this.key].loading : this._loading;
    },
    set: function set$$1(value) {
      if (this._loading !== value) {
        this._loading = value;
        if (this.vm.$data.$apolloData && this.vm.$data.$apolloData.queries[this.key]) {
          this.vm.$data.$apolloData.queries[this.key].loading = value;
          this.vm.$data.$apolloData.loading += value ? 1 : -1;
        }
      }
    }
  }, {
    key: 'loadingKey',
    get: function get$$1() {
      return this.options.loadingKey || this.vm.$apollo.loadingKey;
    }
  }]);
  return SmartQuery;
}(SmartApollo);

var SmartSubscription = function (_SmartApollo) {
  inherits(SmartSubscription, _SmartApollo);

  function SmartSubscription() {
    var _ref;

    var _temp, _this, _ret;

    classCallCheck(this, SmartSubscription);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = possibleConstructorReturn(this, (_ref = SmartSubscription.__proto__ || Object.getPrototypeOf(SmartSubscription)).call.apply(_ref, [this].concat(args))), _this), _this.type = 'subscription', _this.vueApolloSpecialKeys = ['variables', 'result', 'error', 'throttle', 'debounce', 'linkedQuery'], _temp), possibleConstructorReturn(_this, _ret);
  }

  createClass(SmartSubscription, [{
    key: 'executeApollo',
    value: function executeApollo(variables) {
      var variablesJson = JSON.stringify(variables);
      if (this.sub) {
        // do nothing if subscription is already running using exactly the same variables
        if (variablesJson === this.previousVariablesJson) {
          return;
        }
        this.sub.unsubscribe();
      }
      this.previousVariablesJson = variablesJson;

      var apolloOptions = this.generateApolloOptions(variables);

      if (typeof apolloOptions.updateQuery === 'function') {
        apolloOptions.updateQuery = apolloOptions.updateQuery.bind(this.vm);
      }

      if (this.options.linkedQuery) {
        if (typeof this.options.result === 'function') {
          var rcb = this.options.result.bind(this.vm);
          var ucb = apolloOptions.updateQuery && apolloOptions.updateQuery.bind(this.vm);
          apolloOptions.updateQuery = function () {
            rcb.apply(undefined, arguments);
            ucb && ucb.apply(undefined, arguments);
          };
        }
        this.sub = this.options.linkedQuery.subscribeToMore(apolloOptions);
      } else {
        // Create observer
        this.observer = this.vm.$apollo.subscribe(apolloOptions);

        // Create subscription
        this.sub = this.observer.subscribe({
          next: this.nextResult.bind(this),
          error: this.catchError.bind(this)
        });
      }

      get(SmartSubscription.prototype.__proto__ || Object.getPrototypeOf(SmartSubscription.prototype), 'executeApollo', this).call(this, variables);
    }
  }, {
    key: 'nextResult',
    value: function nextResult(data) {
      if (typeof this.options.result === 'function') {
        this.options.result.call(this.vm, data);
      }
    }
  }]);
  return SmartSubscription;
}(SmartApollo);

var DollarApollo = function () {
  function DollarApollo(vm) {
    classCallCheck(this, DollarApollo);

    this._apolloSubscriptions = [];
    this._watchers = [];

    this.vm = vm;
    this.queries = {};
    this.subscriptions = {};
    this.client = undefined;
    this.loadingKey = undefined;
    this.error = undefined;
  }

  createClass(DollarApollo, [{
    key: 'query',
    value: function query(options) {
      return this.getClient(options).query(options);
    }
  }, {
    key: 'getClient',
    value: function getClient() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

      if (!options || !options.client) {
        if (_typeof(this.client) === 'object') {
          return this.client;
        }
        if (this.client) {
          if (!this.provider.clients) {
            throw new Error('[vue-apollo] Missing \'clients\' options in \'apolloProvider\'');
          } else {
            var _client = this.provider.clients[this.client];
            if (!_client) {
              throw new Error('[vue-apollo] Missing client \'' + this.client + '\' in \'apolloProvider\'');
            }
            return _client;
          }
        }
        return this.provider.defaultClient;
      }
      var client = this.provider.clients[options.client];
      if (!client) {
        throw new Error('[vue-apollo] Missing client \'' + options.client + '\' in \'apolloProvider\'');
      }
      return client;
    }
  }, {
    key: 'watchQuery',
    value: function watchQuery(options) {
      var _this = this;

      var observable = this.getClient(options).watchQuery(options);
      var _subscribe = observable.subscribe.bind(observable);
      observable.subscribe = function (options) {
        var sub = _subscribe(options);
        _this._apolloSubscriptions.push(sub);
        return sub;
      };
      return observable;
    }
  }, {
    key: 'mutate',
    value: function mutate(options) {
      return this.getClient(options).mutate(options);
    }
  }, {
    key: 'subscribe',
    value: function subscribe(options) {
      var _this2 = this;

      if (!this.vm.$isServer) {
        var observable = this.getClient(options).subscribe(options);
        var _subscribe = observable.subscribe.bind(observable);
        observable.subscribe = function (options) {
          var sub = _subscribe(options);
          _this2._apolloSubscriptions.push(sub);
          return sub;
        };
        return observable;
      }
    }
  }, {
    key: 'addSmartQuery',
    value: function addSmartQuery(key, options) {
      var _this3 = this;

      var finalOptions = reapply(options, this.vm);

      var apollo = this.vm.$options.apollo;
      if (apollo && apollo.$query) {
        // Also replaces 'undefined' values
        for (var _key in apollo.$query) {
          if (typeof finalOptions[_key] === 'undefined') {
            finalOptions[_key] = apollo.$query[_key];
          }
        }
      }

      var smart = this.queries[key] = new SmartQuery(this.vm, key, finalOptions, false);
      smart.autostart();

      if (!this.vm.$isServer) {
        var subs = finalOptions.subscribeToMore;
        if (subs) {
          if (Array.isArray(subs)) {
            subs.forEach(function (sub, index) {
              _this3.addSmartSubscription('' + key + index, _extends({}, sub, {
                linkedQuery: smart
              }));
            });
          } else {
            this.addSmartSubscription(key, _extends({}, subs, {
              linkedQuery: smart
            }));
          }
        }
      }

      return smart;
    }
  }, {
    key: 'addSmartSubscription',
    value: function addSmartSubscription(key, options) {
      if (!this.vm.$isServer) {
        options = reapply(options, this.vm);

        var smart = this.subscriptions[key] = new SmartSubscription(this.vm, key, options, false);
        smart.autostart();

        return smart;
      }
    }
  }, {
    key: 'defineReactiveSetter',
    value: function defineReactiveSetter(key, func, deep) {
      var _this4 = this;

      this._watchers.push(this.vm.$watch(func, function (value) {
        _this4[key] = value;
      }, {
        immediate: true,
        deep: deep
      }));
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this._watchers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var unwatch = _step.value;

          unwatch();
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      for (var key in this.queries) {
        this.queries[key].destroy();
      }
      for (var _key2 in this.subscriptions) {
        this.subscriptions[_key2].destroy();
      }
      this._apolloSubscriptions.forEach(function (sub) {
        sub.unsubscribe();
      });
      this._apolloSubscriptions = null;
      this.vm = null;
    }
  }, {
    key: 'provider',
    get: function get$$1() {
      return this.vm.$apolloProvider;
    }
  }, {
    key: 'loading',
    get: function get$$1() {
      return this.vm.$data.$apolloData.loading !== 0;
    }
  }, {
    key: 'data',
    get: function get$$1() {
      return this.vm.$data.$apolloData.data;
    }
  }, {
    key: 'skipAllQueries',
    set: function set$$1(value) {
      for (var key in this.queries) {
        this.queries[key].skip = value;
      }
    }
  }, {
    key: 'skipAllSubscriptions',
    set: function set$$1(value) {
      for (var key in this.subscriptions) {
        this.subscriptions[key].skip = value;
      }
    }
  }, {
    key: 'skipAll',
    set: function set$$1(value) {
      this.skipAllQueries = value;
      this.skipAllSubscriptions = value;
    }
  }]);
  return DollarApollo;
}();

var ApolloProvider = function () {
  function ApolloProvider(options) {
    classCallCheck(this, ApolloProvider);

    if (!options) {
      throw new Error('Options argument required');
    }
    this.clients = options.clients || {};
    this.clients.defaultClient = this.defaultClient = options.defaultClient;
    this.defaultOptions = options.defaultOptions;
    this.watchLoading = options.watchLoading;
    this.errorHandler = options.errorHandler;

    this.prefetchQueries = [];
  }

  createClass(ApolloProvider, [{
    key: 'provide',
    value: function provide() {
      var key = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '$apolloProvider';

      return defineProperty({}, key, this);
    }
  }, {
    key: 'addQueryToPrefetch',
    value: function addQueryToPrefetch(queryOptions, client) {
      this.prefetchQueries.push({
        queryOptions: queryOptions,
        client: client
      });
    }
  }, {
    key: 'prefetchComponent',
    value: function prefetchComponent(component, context) {
      component = getMergedDefinition(component);
      var apolloOptions = component.apollo;

      if (!apolloOptions) {
        return;
      }

      var componentClient = apolloOptions.$client;
      for (var key in apolloOptions) {
        var options = apolloOptions[key];
        if (key.charAt(0) !== '$' && (!options.query || (typeof options.ssr === 'undefined' || options.ssr) && typeof options.prefetch !== 'undefined' && options.prefetch)) {
          this.addQueryToPrefetch(options, options.client || componentClient);
        }
      }
    }
  }, {
    key: 'prefetchComponents',
    value: function prefetchComponents(definitions) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = definitions[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var def = _step.value;

          this.prefetchComponent(def);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  }, {
    key: 'prefetchAll',
    value: function prefetchAll(context, components, options) {
      var _this = this;

      // Optional components argument
      if (!options && components && !Array.isArray(components)) {
        options = components;
        components = undefined;
      }

      var finalOptions = Object.assign({}, {
        includeGlobal: true
      }, options);

      if (components) {
        this.prefetchComponents(components);
      }

      if (finalOptions.includeGlobal) {
        this.prefetchComponents(globalPrefetchs.filter(function (_ref2) {
          var component = _ref2.component,
              contextCallback = _ref2.contextCallback;

          var result = true;
          if (typeof contextCallback === 'function') {
            result = !!contextCallback(context);
          }
          return result;
        }).map(function (_ref3) {
          var component = _ref3.component;
          return component;
        }), context);
      }

      return Promise.all(this.prefetchQueries.map(function (o) {
        return _this.prefetchQuery(o.queryOptions, context, o.client);
      }));
    }
  }, {
    key: 'prefetchQuery',
    value: function prefetchQuery(queryOptions, context, client) {
      var variables = void 0;

      // Client
      if (!client) {
        client = this.defaultClient;
      } else if (typeof client === 'string') {
        client = this.clients[client];
        if (!client) {
          throw new Error('[vue-apollo] Missing client \'' + client + '\' in \'apolloProvider\'');
        }
      }

      // Simple query
      if (!queryOptions.query) {
        queryOptions = {
          query: queryOptions
        };
      } else {
        var prefetch = queryOptions.prefetch;
        var prefetchType = typeof prefetch === 'undefined' ? 'undefined' : _typeof(prefetch);

        // Resolve variables
        if (prefetchType !== 'undefined') {
          var result = void 0;
          if (prefetchType === 'function') {
            result = prefetch(context);
          } else {
            result = prefetch;
          }

          if (!result) {
            return Promise.resolve();
          } else if (prefetchType === 'boolean') {
            var optVariables = queryOptions.variables;
            if (typeof optVariables !== 'undefined') {
              // Reuse `variables` option with `prefetch: true`
              if (typeof optVariables === 'function') {
                variables = optVariables.call(context);
              } else {
                variables = optVariables;
              }
            } else {
              variables = undefined;
            }
          } else {
            variables = result;
          }
        }
      }

      // Query
      if (typeof queryOptions.query === 'function') {
        queryOptions.query = queryOptions.query(context);
      }
      return new Promise(function (resolve, reject) {
        var options = omit(queryOptions, [].concat(toConsumableArray(VUE_APOLLO_QUERY_KEYWORDS), ['fetchPolicy']));
        options.variables = variables;
        options.fetchPolicy = 'network-only';
        client.query(options).then(resolve, reject);
      });
    }
  }, {
    key: 'getStates',
    value: function getStates(options) {
      var finalOptions = Object.assign({}, {
        exportNamespace: ''
      }, options);
      var states = {};
      for (var key in this.clients) {
        var client = this.clients[key];
        var state = client.cache.extract();
        states['' + finalOptions.exportNamespace + key] = state;
      }
      return states;
    }
  }, {
    key: 'exportStates',
    value: function exportStates(options) {
      var finalOptions = Object.assign({}, {
        globalName: '__APOLLO_STATE__',
        attachTo: 'window'
      }, options);
      var states = this.getStates(finalOptions);
      var js = finalOptions.attachTo + '.' + finalOptions.globalName + ' = ' + JSON.stringify(states) + ';';
      return js;
    }
  }]);
  return ApolloProvider;
}();

var globalPrefetchs = [];

function willPrefetch(component) {
  var contextCallback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

  globalPrefetchs.push({ component: component, contextCallback: contextCallback });
  return component;
}

// Global access for libraries
if (typeof window !== 'undefined') {
  window.vueApolloWillPrefetch = willPrefetch;
} else if (typeof global !== 'undefined') {
  global.vueApolloWillPrefetch = willPrefetch;
}

function isDataFilled(data) {
  return Object.keys(data).length > 0;
}

var CApolloQuery = {
  name: 'ApolloQuery',

  provide: function provide() {
    return {
      getDollarApollo: this.getDollarApollo,
      getApolloQuery: this.getApolloQuery
    };
  },


  props: {
    query: {
      type: Object,
      required: true
    },

    variables: {
      type: Object,
      default: undefined
    },

    fetchPolicy: {
      type: String,
      default: undefined
    },

    pollInterval: {
      type: Number,
      default: undefined
    },

    notifyOnNetworkStatusChange: {
      type: Boolean,
      default: undefined
    },

    context: {
      type: Object,
      default: undefined
    },

    skip: {
      type: Boolean,
      default: false
    },

    clientId: {
      type: String,
      default: undefined
    },

    deep: {
      type: Boolean,
      default: undefined
    },

    tag: {
      type: String,
      default: 'div'
    }
  },

  data: function data() {
    return {
      result: {
        data: null,
        loading: false,
        networkStatus: 7,
        error: null,
        times: 0
      }
    };
  },


  watch: {
    fetchPolicy: function fetchPolicy(value) {
      this.$apollo.queries.query.setOptions({
        fetchPolicy: value
      });
    },
    pollInterval: function pollInterval(value) {
      this.$apollo.queries.query.setOptions({
        pollInterval: value
      });
    },
    notifyOnNetworkStatusChange: function notifyOnNetworkStatusChange(value) {
      this.$apollo.queries.query.setOptions({
        notifyOnNetworkStatusChange: value
      });
    }
  },

  apollo: {
    $client: function $client() {
      return this.clientId;
    },
    query: function query() {
      return {
        query: function query() {
          return this.query;
        },
        variables: function variables() {
          return this.variables;
        },

        fetchPolicy: this.fetchPolicy,
        pollInterval: this.pollInterval,
        notifyOnNetworkStatusChange: this.notifyOnNetworkStatusChange,
        context: function context() {
          return this.context;
        },
        skip: function skip() {
          return this.skip;
        },

        deep: this.deep,
        manual: true,
        result: function result(_result) {
          var _result2 = _result,
              errors = _result2.errors,
              loading = _result2.loading,
              networkStatus = _result2.networkStatus;
          var _result3 = _result,
              error = _result3.error;

          _result = Object.assign({}, _result);

          if (errors && errors.length) {
            error = new Error('Apollo errors occured (' + errors.length + ')');
            error.graphQLErrors = errors;
          }

          var data = {};

          if (loading) {
            Object.assign(data, this.$_previousData, _result.data);
          } else if (error) {
            Object.assign(data, this.$apollo.queries.query.observer.getLastResult() || {}, _result.data);
          } else {
            data = _result.data;
            this.$_previousData = _result.data;
          }

          this.result = {
            data: isDataFilled(data) ? data : undefined,
            loading: loading,
            error: error,
            networkStatus: networkStatus,
            times: ++this.$_times
          };

          this.$emit('result', this.result);
        },
        error: function error(_error) {
          this.result.loading = false;
          this.result.error = _error;
          console.log(this.$apollo.queries.query.observer.currentResult());
          this.$emit('error', _error);
        }
      };
    }
  },

  created: function created() {
    this.$_times = 0;
  },


  methods: {
    getDollarApollo: function getDollarApollo() {
      return this.$apollo;
    },
    getApolloQuery: function getApolloQuery() {
      return this.$apollo.queries.query;
    }
  },

  render: function render(h) {
    var result = this.$scopedSlots.default({
      result: this.result,
      query: this.$apollo.queries.query,
      isLoading: this.$apolloData.loading
    });
    if (Array.isArray(result)) {
      result = result.concat(this.$slots.default);
    } else {
      result = [result].concat(this.$slots.default);
    }
    return h(this.tag, result);
  }
};

var uid = 0;

var CApolloSubscribeToMore = {
  name: 'ApolloSubscribeToMore',

  inject: ['getDollarApollo', 'getApolloQuery'],

  props: {
    document: {
      type: Object,
      required: true
    },

    variables: {
      type: Object,
      default: undefined
    },

    updateQuery: {
      type: Function,
      default: undefined
    }
  },

  watch: {
    document: 'refresh',
    variables: 'refresh'
  },

  created: function created() {
    this.$_key = 'sub_component_' + uid++;
  },
  mounted: function mounted() {
    this.refresh();
  },
  beforeDestroy: function beforeDestroy() {
    this.destroy();
  },


  methods: {
    destroy: function destroy() {
      if (this.$_sub) {
        this.$_sub.destroy();
      }
    },
    refresh: function refresh() {
      this.destroy();

      this.$_sub = this.getDollarApollo().addSmartSubscription(this.$_key, {
        document: this.document,
        variables: this.variables,
        updateQuery: this.updateQuery,
        linkedQuery: this.getApolloQuery()
      });
    }
  },

  render: function render(h) {
    return null;
  }
};

var CApolloMutation = {
  props: {
    mutation: {
      type: Object,
      required: true
    },

    variables: {
      type: Object,
      default: undefined
    },

    optimisticResponse: {
      type: Object,
      default: undefined
    },

    update: {
      type: Function,
      default: undefined
    },

    refetchQueries: {
      type: Function,
      default: undefined
    },

    tag: {
      type: String,
      default: 'div'
    }
  },

  data: function data() {
    return {
      loading: false,
      error: null
    };
  },


  methods: {
    mutate: function mutate(options) {
      var _this = this;

      return asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var result;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _this.loading = true;
                _this.error = null;
                _context.prev = 2;
                _context.next = 5;
                return _this.$apollo.mutate(_extends({
                  mutation: _this.mutation,
                  variables: _this.variables,
                  optimisticResponse: _this.optimisticResponse,
                  update: _this.update,
                  refetchQueries: _this.refetchQueries
                }, options));

              case 5:
                result = _context.sent;

                _this.$emit('done', result);
                _context.next = 13;
                break;

              case 9:
                _context.prev = 9;
                _context.t0 = _context['catch'](2);

                _this.error = _context.t0;
                _this.$emit('error', _context.t0);

              case 13:
                _this.loading = false;

              case 14:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, _this, [[2, 9]]);
      }))();
    }
  },

  render: function render(h) {
    var result = this.$scopedSlots.default({
      mutate: this.mutate,
      loading: this.loading,
      error: this.error
    });
    if (Array.isArray(result)) {
      result = result.concat(this.$slots.default);
    } else {
      result = [result].concat(this.$slots.default);
    }
    return h(this.tag, result);
  }
};

var keywords = ['$subscribe'];

function hasProperty(holder, key) {
  return typeof holder !== 'undefined' && holder.hasOwnProperty(key);
}

var launch = function launch() {
  var _this = this;

  var apolloProvider = this.$apolloProvider;

  if (this._apolloLaunched || !apolloProvider) return;
  this._apolloLaunched = true;

  // Prepare properties
  var apollo = this.$options.apollo;

  if (apollo) {
    if (!apollo.$init) {
      apollo.$init = true;

      // Default options applied to `apollo` options
      if (apolloProvider.defaultOptions) {
        apollo = this.$options.apollo = Object.assign({}, apolloProvider.defaultOptions, apollo);
      }
    }

    defineReactiveSetter(this.$apollo, 'skipAll', apollo.$skipAll, apollo.$deep);
    defineReactiveSetter(this.$apollo, 'skipAllQueries', apollo.$skipAllQueries, apollo.$deep);
    defineReactiveSetter(this.$apollo, 'skipAllSubscriptions', apollo.$skipAllSubscriptions, apollo.$deep);
    defineReactiveSetter(this.$apollo, 'client', apollo.$client, apollo.$deep);
    defineReactiveSetter(this.$apollo, 'loadingKey', apollo.$loadingKey, apollo.$deep);
    defineReactiveSetter(this.$apollo, 'error', apollo.$error, apollo.$deep);
    defineReactiveSetter(this.$apollo, 'watchLoading', apollo.$watchLoading, apollo.$deep);

    // Apollo Data
    Object.defineProperty(this, '$apolloData', {
      get: function get$$1() {
        return _this.$data.$apolloData;
      },
      enumerable: true,
      configurable: true
    });

    // watchQuery

    var _loop = function _loop(key) {
      if (key.charAt(0) !== '$') {
        var options = apollo[key];
        // Property proxy
        if (!options.manual && !hasProperty(_this, key) && !hasProperty(_this.$props, key) && !hasProperty(_this.$data, key)) {
          Object.defineProperty(_this, key, {
            get: function get$$1() {
              return _this.$data.$apolloData.data[key];
            },
            enumerable: true,
            configurable: true
          });
        }
        _this.$apollo.addSmartQuery(key, options);
      }
    };

    for (var key in apollo) {
      _loop(key);
    }

    if (apollo.subscribe) {
      Globals.Vue.util.warn('vue-apollo -> `subscribe` option is deprecated. Use the `$subscribe` option instead.');
    }

    if (apollo.$subscribe) {
      for (var key in apollo.$subscribe) {
        this.$apollo.addSmartSubscription(key, apollo.$subscribe[key]);
      }
    }
  }
};

function defineReactiveSetter($apollo, key, value, deep) {
  if (typeof value !== 'undefined') {
    if (typeof value === 'function') {
      $apollo.defineReactiveSetter(key, value, deep);
    } else {
      $apollo[key] = value;
    }
  }
}

function install(Vue, options) {
  if (install.installed) return;
  install.installed = true;

  Globals.Vue = Vue;

  // Options merging
  var merge = Vue.config.optionMergeStrategies.methods;
  Vue.config.optionMergeStrategies.apollo = function (toVal, fromVal, vm) {
    if (!toVal) return fromVal;
    if (!fromVal) return toVal;

    var toData = Object.assign({}, omit(toVal, keywords), toVal.data);
    var fromData = Object.assign({}, omit(fromVal, keywords), fromVal.data);

    var map = {};
    for (var i = 0; i < keywords.length; i++) {
      var key = keywords[i];
      map[key] = merge(toVal[key], fromVal[key]);
    }

    return Object.assign(map, merge(toData, fromData));
  };

  // Lazy creation
  Object.defineProperty(Vue.prototype, '$apollo', {
    get: function get$$1() {
      if (!this._apollo) {
        this._apollo = new DollarApollo(this);
      }
      return this._apollo;
    }
  });

  var vueVersion = Vue.version.substr(0, Vue.version.indexOf('.'));

  Vue.mixin(_extends({}, vueVersion === '1' ? {
    init: function init() {
      var apolloProvider = void 0;
      if (this.$options.apolloProvider) {
        apolloProvider = this._apolloProvider = this.$options.apolloProvider;
      } else {
        apolloProvider = this.$root._apolloProvider;
      }
      this.$apolloProvider = apolloProvider;
    }
  } : {}, vueVersion === '2' ? {
    inject: {
      $apolloProvider: { default: null }
    },

    data: function data() {
      return {
        '$apolloData': {
          queries: {},
          loading: 0,
          data: {}
        }
      };
    }
  } : {}, {

    created: launch,

    destroyed: function destroyed() {
      if (this._apollo) {
        this._apollo.destroy();
        this._apollo = null;
      }
    }

  }));

  if (vueVersion === '2') {
    Vue.component('apollo-query', CApolloQuery);
    Vue.component('ApolloQuery', CApolloQuery);
    Vue.component('apollo-subscribe-to-more', CApolloSubscribeToMore);
    Vue.component('ApolloSubscribeToMore', CApolloSubscribeToMore);
    Vue.component('apollo-mutation', CApolloMutation);
    Vue.component('ApolloMutation', CApolloMutation);
  }
}

ApolloProvider.install = install;

// eslint-disable-next-line no-undef
ApolloProvider.version = "3.0.0-beta.13";

// Apollo provider
var ApolloProvider$1 = ApolloProvider;
// Components
var ApolloQuery = CApolloQuery;
var ApolloSubscribeToMore = CApolloSubscribeToMore;
var ApolloMutation = CApolloMutation;

// Auto-install
var GlobalVue = null;
if (typeof window !== 'undefined') {
  GlobalVue = window.Vue;
} else if (typeof global !== 'undefined') {
  GlobalVue = global.Vue;
}
if (GlobalVue) {
  GlobalVue.use(ApolloProvider);
}

exports.install = install;
exports.ApolloProvider = ApolloProvider$1;
exports.ApolloQuery = ApolloQuery;
exports.ApolloSubscribeToMore = ApolloSubscribeToMore;
exports.ApolloMutation = ApolloMutation;
exports.default = ApolloProvider;
exports.willPrefetch = willPrefetch;

Object.defineProperty(exports, '__esModule', { value: true });

})));
