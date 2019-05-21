(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global['vue-apollo'] = {})));
}(this, (function (exports) { 'use strict';

  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
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
  }

  function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};
      var ownKeys = Object.keys(source);

      if (typeof Object.getOwnPropertySymbols === 'function') {
        ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
          return Object.getOwnPropertyDescriptor(source, sym).enumerable;
        }));
      }

      ownKeys.forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    }

    return target;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    }

    return _assertThisInitialized(self);
  }

  function _superPropBase(object, property) {
    while (!Object.prototype.hasOwnProperty.call(object, property)) {
      object = _getPrototypeOf(object);
      if (object === null) break;
    }

    return object;
  }

  function _get(target, property, receiver) {
    if (typeof Reflect !== "undefined" && Reflect.get) {
      _get = Reflect.get;
    } else {
      _get = function _get(target, property, receiver) {
        var base = _superPropBase(target, property);

        if (!base) return;
        var desc = Object.getOwnPropertyDescriptor(base, property);

        if (desc.get) {
          return desc.get.call(receiver);
        }

        return desc.value;
      };
    }

    return _get(target, property, receiver || target);
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    }
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArray(iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
  }

  function _iterableToArrayLimit(arr, i) {
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
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance");
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance");
  }

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  function getCjsExportFromNamespace (n) {
  	return n && n['default'] || n;
  }

  /* eslint-disable no-undefined,no-param-reassign,no-shadow */

  /**
   * Throttle execution of a function. Especially useful for rate limiting
   * execution of handlers on events like resize and scroll.
   *
   * @param  {Number}    delay          A zero-or-greater delay in milliseconds. For event callbacks, values around 100 or 250 (or even higher) are most useful.
   * @param  {Boolean}   [noTrailing]   Optional, defaults to false. If noTrailing is true, callback will only execute every `delay` milliseconds while the
   *                                    throttled-function is being called. If noTrailing is false or unspecified, callback will be executed one final time
   *                                    after the last throttled-function call. (After the throttled-function has not been called for `delay` milliseconds,
   *                                    the internal counter is reset)
   * @param  {Function}  callback       A function to be executed after delay milliseconds. The `this` context and all arguments are passed through, as-is,
   *                                    to `callback` when the throttled-function is executed.
   * @param  {Boolean}   [debounceMode] If `debounceMode` is true (at begin), schedule `clear` to execute after `delay` ms. If `debounceMode` is false (at end),
   *                                    schedule `callback` to execute after `delay` ms.
   *
   * @return {Function}  A new, throttled, function.
   */
  function throttle (delay, noTrailing, callback, debounceMode) {
    /*
     * After wrapper has stopped being called, this timeout ensures that
     * `callback` is executed at the proper times in `throttle` and `end`
     * debounce modes.
     */
    var timeoutID;
    var cancelled = false; // Keep track of the last time `callback` was executed.

    var lastExec = 0; // Function to clear existing timeout

    function clearExistingTimeout() {
      if (timeoutID) {
        clearTimeout(timeoutID);
      }
    } // Function to cancel next exec


    function cancel() {
      clearExistingTimeout();
      cancelled = true;
    } // `noTrailing` defaults to falsy.


    if (typeof noTrailing !== 'boolean') {
      debounceMode = callback;
      callback = noTrailing;
      noTrailing = undefined;
    }
    /*
     * The `wrapper` function encapsulates all of the throttling / debouncing
     * functionality and when executed will limit the rate at which `callback`
     * is executed.
     */


    function wrapper() {
      var self = this;
      var elapsed = Date.now() - lastExec;
      var args = arguments;

      if (cancelled) {
        return;
      } // Execute `callback` and update the `lastExec` timestamp.


      function exec() {
        lastExec = Date.now();
        callback.apply(self, args);
      }
      /*
       * If `debounceMode` is true (at begin) this is used to clear the flag
       * to allow future `callback` executions.
       */


      function clear() {
        timeoutID = undefined;
      }

      if (debounceMode && !timeoutID) {
        /*
         * Since `wrapper` is being called for the first time and
         * `debounceMode` is true (at begin), execute `callback`.
         */
        exec();
      }

      clearExistingTimeout();

      if (debounceMode === undefined && elapsed > delay) {
        /*
         * In throttle mode, if `delay` time has been exceeded, execute
         * `callback`.
         */
        exec();
      } else if (noTrailing !== true) {
        /*
         * In trailing throttle mode, since `delay` time has not been
         * exceeded, schedule `callback` to execute `delay` ms after most
         * recent execution.
         *
         * If `debounceMode` is true (at begin), schedule `clear` to execute
         * after `delay` ms.
         *
         * If `debounceMode` is false (at end), schedule `callback` to
         * execute after `delay` ms.
         */
        timeoutID = setTimeout(debounceMode ? clear : exec, debounceMode === undefined ? delay - elapsed : delay);
      }
    }

    wrapper.cancel = cancel; // Return the wrapper function.

    return wrapper;
  }

  /* eslint-disable no-undefined */
  /**
   * Debounce execution of a function. Debouncing, unlike throttling,
   * guarantees that a function is only executed a single time, either at the
   * very beginning of a series of calls, or at the very end.
   *
   * @param  {Number}   delay         A zero-or-greater delay in milliseconds. For event callbacks, values around 100 or 250 (or even higher) are most useful.
   * @param  {Boolean}  [atBegin]     Optional, defaults to false. If atBegin is false or unspecified, callback will only be executed `delay` milliseconds
   *                                  after the last debounced-function call. If atBegin is true, callback will be executed only at the first debounced-function call.
   *                                  (After the throttled-function has not been called for `delay` milliseconds, the internal counter is reset).
   * @param  {Function} callback      A function to be executed after delay milliseconds. The `this` context and all arguments are passed through, as-is,
   *                                  to `callback` when the debounced-function is executed.
   *
   * @return {Function} A new, debounced function.
   */

  function debounce (delay, atBegin, callback) {
    return callback === undefined ? throttle(delay, atBegin, false) : throttle(delay, callback, atBegin !== false);
  }

  var index_esm = /*#__PURE__*/Object.freeze({
    throttle: throttle,
    debounce: debounce
  });

  var utils = createCommonjsModule(function (module, exports) {
    var Globals = exports.Globals = {};

    function factory(action) {
      return function (cb, time) {
        return action(time, cb);
      };
    }

    exports.throttle = factory(index_esm.throttle);
    exports.debounce = factory(index_esm.debounce);

    exports.getMergedDefinition = function (def) {
      return Globals.Vue.util.mergeOptions({}, def);
    };

    exports.reapply = function (options, context) {
      while (typeof options === 'function') {
        options = options.call(context);
      }

      return options;
    };

    exports.omit = function (obj, properties) {
      return Object.entries(obj).filter(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 1),
            key = _ref2[0];

        return !properties.includes(key);
      }).reduce(function (c, _ref3) {
        var _ref4 = _slicedToArray(_ref3, 2),
            key = _ref4[0],
            val = _ref4[1];

        c[key] = val;
        return c;
      }, {});
    };

    exports.addGqlError = function (error) {
      if (error.graphQLErrors && error.graphQLErrors.length) {
        error.gqlError = error.graphQLErrors[0];
      }
    };

    exports.noop = function () {};
  });
  var utils_1 = utils.Globals;
  var utils_2 = utils.throttle;
  var utils_3 = utils.debounce;
  var utils_4 = utils.getMergedDefinition;
  var utils_5 = utils.reapply;
  var utils_6 = utils.omit;
  var utils_7 = utils.addGqlError;
  var utils_8 = utils.noop;

  var SmartApollo =
  /*#__PURE__*/
  function () {
    function SmartApollo(vm, key, options) {
      var autostart = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

      _classCallCheck(this, SmartApollo);

      _defineProperty(this, "type", null);

      _defineProperty(this, "vueApolloSpecialKeys", []);

      this.vm = vm;
      this.key = key;
      this.initialOptions = options;
      this.options = Object.assign({}, options);
      this._skip = false;
      this._watchers = [];
      this._destroyed = false;

      if (autostart) {
        this.autostart();
      }
    }

    _createClass(SmartApollo, [{
      key: "autostart",
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
      key: "skipChanged",
      value: function skipChanged(value, oldValue) {
        if (value !== oldValue) {
          this.skip = value;
        }
      }
    }, {
      key: "refresh",
      value: function refresh() {
        if (!this._skip) {
          this.stop();
          this.start();
        }
      }
    }, {
      key: "start",
      value: function start() {
        var _this = this;

        this.starting = true; // Query callback

        if (typeof this.initialOptions.query === 'function') {
          var queryCb = this.initialOptions.query.bind(this.vm);
          this.options.query = queryCb();

          this._watchers.push(this.vm.$watch(queryCb, function (query) {
            _this.options.query = query;

            _this.refresh();
          }, {
            deep: this.options.deep
          }));
        } // Query callback


        if (typeof this.initialOptions.document === 'function') {
          var _queryCb = this.initialOptions.document.bind(this.vm);

          this.options.document = _queryCb();

          this._watchers.push(this.vm.$watch(_queryCb, function (document) {
            _this.options.document = document;

            _this.refresh();
          }, {
            deep: this.options.deep
          }));
        } // Apollo context


        if (typeof this.initialOptions.context === 'function') {
          var cb = this.initialOptions.context.bind(this.vm);
          this.options.context = cb();

          this._watchers.push(this.vm.$watch(cb, function (context) {
            _this.options.context = context;

            _this.refresh();
          }, {
            deep: this.options.deep
          }));
        } // GraphQL Variables


        if (typeof this.options.variables === 'function') {
          var _cb = this.executeApollo.bind(this);

          _cb = this.options.throttle ? utils_2(_cb, this.options.throttle) : _cb;
          _cb = this.options.debounce ? utils_3(_cb, this.options.debounce) : _cb;

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
      key: "stop",
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
            if (!_iteratorNormalCompletion && _iterator["return"] != null) {
              _iterator["return"]();
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
      key: "generateApolloOptions",
      value: function generateApolloOptions(variables) {
        var apolloOptions = utils_6(this.options, this.vueApolloSpecialKeys);
        apolloOptions.variables = variables;
        return apolloOptions;
      }
    }, {
      key: "executeApollo",
      value: function executeApollo(variables) {
        this.starting = false;
      }
    }, {
      key: "nextResult",
      value: function nextResult(result) {
        var error = result.error;
        if (error) utils_7(error);
      }
    }, {
      key: "callHandlers",
      value: function callHandlers(handlers) {
        var catched = false;

        for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
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
            if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
              _iterator2["return"]();
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
      key: "errorHandler",
      value: function errorHandler() {
        for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        return this.callHandlers.apply(this, [[this.options.error, this.vm.$apollo.error, this.vm.$apollo.provider.errorHandler]].concat(args));
      }
    }, {
      key: "catchError",
      value: function catchError(error) {
        utils_7(error);
        var catched = this.errorHandler(error);
        if (catched) return;

        if (error.graphQLErrors && error.graphQLErrors.length !== 0) {
          console.error("GraphQL execution errors for ".concat(this.type, " '").concat(this.key, "'"));
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
              if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
                _iterator3["return"]();
              }
            } finally {
              if (_didIteratorError3) {
                throw _iteratorError3;
              }
            }
          }
        } else if (error.networkError) {
          console.error("Error sending the ".concat(this.type, " '").concat(this.key, "'"), error.networkError);
        } else {
          console.error("[vue-apollo] An error has occured for ".concat(this.type, " '").concat(this.key, "'"));

          if (Array.isArray(error)) {
            var _console;

            (_console = console).error.apply(_console, _toConsumableArray(error));
          } else {
            console.error(error);
          }
        }
      }
    }, {
      key: "destroy",
      value: function destroy() {
        if (this._destroyed) return;
        this._destroyed = true;
        this.stop();

        if (this._skipWatcher) {
          this._skipWatcher();
        }
      }
    }, {
      key: "skip",
      get: function get() {
        return this._skip;
      },
      set: function set(value) {
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

  var SmartQuery =
  /*#__PURE__*/
  function (_SmartApollo) {
    _inherits(SmartQuery, _SmartApollo);

    function SmartQuery(vm, key, options) {
      var _this;

      var autostart = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

      _classCallCheck(this, SmartQuery);

      // Simple query
      if (!options.query) {
        var query = options;
        options = {
          query: query
        };
      } // Add reactive data related to the query


      if (vm.$data.$apolloData && !vm.$data.$apolloData.queries[key]) {
        vm.$set(vm.$data.$apolloData.queries, key, {
          loading: false
        });
      }

      _this = _possibleConstructorReturn(this, _getPrototypeOf(SmartQuery).call(this, vm, key, options, false));

      _defineProperty(_assertThisInitialized(_this), "type", 'query');

      _defineProperty(_assertThisInitialized(_this), "vueApolloSpecialKeys", VUE_APOLLO_QUERY_KEYWORDS);

      _defineProperty(_assertThisInitialized(_this), "_loading", false);

      if (vm.$isServer) {
        _this.firstRun = new Promise(function (resolve, reject) {
          _this._firstRunResolve = resolve;
          _this._firstRunReject = reject;
        });
      }

      if (_this.vm.$isServer) {
        _this.options.fetchPolicy = 'network-only';
      }

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

      if (autostart) {
        _this.autostart();
      }

      return _this;
    }

    _createClass(SmartQuery, [{
      key: "stop",
      value: function stop() {
        _get(_getPrototypeOf(SmartQuery.prototype), "stop", this).call(this);

        this.loadingDone();

        if (this.observer) {
          this.observer.stopPolling();
          this.observer = null;
        }
      }
    }, {
      key: "executeApollo",
      value: function executeApollo(variables) {
        var variablesJson = JSON.stringify(variables);

        if (this.sub) {
          if (variablesJson === this.previousVariablesJson) {
            return;
          }

          this.sub.unsubscribe();
        }

        this.previousVariablesJson = variablesJson; // Create observer

        this.observer = this.vm.$apollo.watchQuery(this.generateApolloOptions(variables));
        this.startQuerySubscription();

        if (this.options.fetchPolicy !== 'no-cache') {
          var currentResult = this.maySetLoading();

          if (!currentResult.loading) {
            this.nextResult(currentResult);
          }
        }

        _get(_getPrototypeOf(SmartQuery.prototype), "executeApollo", this).call(this, variables);
      }
    }, {
      key: "startQuerySubscription",
      value: function startQuerySubscription() {
        if (this.sub && !this.sub.closed) return; // Create subscription

        this.sub = this.observer.subscribe({
          next: this.nextResult.bind(this),
          error: this.catchError.bind(this)
        });
      }
    }, {
      key: "maySetLoading",
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
      key: "nextResult",
      value: function nextResult(result) {
        _get(_getPrototypeOf(SmartQuery.prototype), "nextResult", this).call(this, result);

        var data = result.data,
            loading = result.loading,
            error = result.error;

        if (error) {
          this.firstRunReject();
        }

        if (!loading) {
          this.loadingDone();
        }

        var hasResultCallback = typeof this.options.result === 'function';

        if (typeof data === 'undefined') ; else if (!this.options.manual) {
          if (typeof this.options.update === 'function') {
            this.setData(this.options.update.call(this.vm, data));
          } else if (typeof data[this.key] === 'undefined' && Object.keys(data).length) {
            console.error("Missing ".concat(this.key, " attribute on result"), data);
          } else {
            this.setData(data[this.key]);
          }
        } else if (!hasResultCallback) {
          console.error("".concat(this.key, " query must have a 'result' hook in manual mode"));
        }

        if (hasResultCallback) {
          this.options.result.call(this.vm, result, this.key);
        }
      }
    }, {
      key: "setData",
      value: function setData(value) {
        this.vm.$set(this.hasDataField ? this.vm.$data : this.vm.$data.$apolloData.data, this.key, value);
      }
    }, {
      key: "catchError",
      value: function catchError(error) {
        _get(_getPrototypeOf(SmartQuery.prototype), "catchError", this).call(this, error);

        this.firstRunReject();
        this.loadingDone(error);
        this.nextResult(this.observer.currentResult()); // The observable closes the sub if an error occurs

        this.resubscribeToQuery();
      }
    }, {
      key: "resubscribeToQuery",
      value: function resubscribeToQuery() {
        var lastError = this.observer.getLastError();
        var lastResult = this.observer.getLastResult();
        this.observer.resetLastResults();
        this.startQuerySubscription();
        Object.assign(this.observer, {
          lastError: lastError,
          lastResult: lastResult
        });
      }
    }, {
      key: "watchLoading",
      value: function watchLoading() {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        return this.callHandlers.apply(this, [[this.options.watchLoading, this.vm.$apollo.watchLoading, this.vm.$apollo.provider.watchLoading]].concat(args, [this]));
      }
    }, {
      key: "applyLoadingModifier",
      value: function applyLoadingModifier(value) {
        var loadingKey = this.loadingKey;

        if (loadingKey && typeof this.vm[loadingKey] === 'number') {
          this.vm[loadingKey] += value;
        }

        this.watchLoading(value === 1, value);
      }
    }, {
      key: "loadingDone",
      value: function loadingDone() {
        var error = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

        if (this.loading) {
          this.applyLoadingModifier(-1);
        }

        this.loading = false;

        if (!error) {
          this.firstRunResolve();
        }
      }
    }, {
      key: "fetchMore",
      value: function fetchMore() {
        var _this2 = this;

        if (this.observer) {
          var _this$observer;

          this.maySetLoading(true);
          return (_this$observer = this.observer).fetchMore.apply(_this$observer, arguments).then(function (result) {
            if (!result.loading) {
              _this2.loadingDone();
            }

            return result;
          });
        }
      }
    }, {
      key: "subscribeToMore",
      value: function subscribeToMore() {
        if (this.observer) {
          var _this$observer2;

          return {
            unsubscribe: (_this$observer2 = this.observer).subscribeToMore.apply(_this$observer2, arguments)
          };
        }
      }
    }, {
      key: "refetch",
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
      key: "setVariables",
      value: function setVariables(variables, tryFetch) {
        this.options.variables = variables;

        if (this.observer) {
          var result = this.observer.setVariables(variables, tryFetch);
          this.maySetLoading();
          return result;
        }
      }
    }, {
      key: "setOptions",
      value: function setOptions(options) {
        Object.assign(this.options, options);

        if (this.observer) {
          var result = this.observer.setOptions(options);
          this.maySetLoading();
          return result;
        }
      }
    }, {
      key: "startPolling",
      value: function startPolling() {
        if (this.observer) {
          var _this$observer3;

          return (_this$observer3 = this.observer).startPolling.apply(_this$observer3, arguments);
        }
      }
    }, {
      key: "stopPolling",
      value: function stopPolling() {
        if (this.observer) {
          var _this$observer4;

          return (_this$observer4 = this.observer).stopPolling.apply(_this$observer4, arguments);
        }
      }
    }, {
      key: "firstRunResolve",
      value: function firstRunResolve() {
        if (this._firstRunResolve) {
          this._firstRunResolve();

          this._firstRunResolve = null;
        }
      }
    }, {
      key: "firstRunReject",
      value: function firstRunReject(error) {
        if (this._firstRunReject) {
          this._firstRunReject(error);

          this._firstRunReject = null;
        }
      }
    }, {
      key: "destroy",
      value: function destroy() {
        _get(_getPrototypeOf(SmartQuery.prototype), "destroy", this).call(this);

        if (this.loading) {
          this.watchLoading(false, -1);
        }

        this.loading = false;
      }
    }, {
      key: "client",
      get: function get$$1() {
        return this.vm.$apollo.getClient(this.options);
      }
    }, {
      key: "loading",
      get: function get$$1() {
        return this.vm.$data.$apolloData && this.vm.$data.$apolloData.queries[this.key] ? this.vm.$data.$apolloData.queries[this.key].loading : this._loading;
      },
      set: function set(value) {
        if (this._loading !== value) {
          this._loading = value;

          if (this.vm.$data.$apolloData && this.vm.$data.$apolloData.queries[this.key]) {
            this.vm.$data.$apolloData.queries[this.key].loading = value;
            this.vm.$data.$apolloData.loading += value ? 1 : -1;
          }
        }
      }
    }, {
      key: "loadingKey",
      get: function get$$1() {
        return this.options.loadingKey || this.vm.$apollo.loadingKey;
      }
    }]);

    return SmartQuery;
  }(SmartApollo);

  var SmartSubscription =
  /*#__PURE__*/
  function (_SmartApollo) {
    _inherits(SmartSubscription, _SmartApollo);

    function SmartSubscription() {
      var _getPrototypeOf2;

      var _this;

      _classCallCheck(this, SmartSubscription);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      _this = _possibleConstructorReturn(this, (_getPrototypeOf2 = _getPrototypeOf(SmartSubscription)).call.apply(_getPrototypeOf2, [this].concat(args)));

      _defineProperty(_assertThisInitialized(_this), "type", 'subscription');

      _defineProperty(_assertThisInitialized(_this), "vueApolloSpecialKeys", ['variables', 'result', 'error', 'throttle', 'debounce', 'linkedQuery']);

      return _this;
    }

    _createClass(SmartSubscription, [{
      key: "executeApollo",
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
              rcb.apply(void 0, arguments);
              return ucb && ucb.apply(void 0, arguments);
            };
          }

          this.sub = this.options.linkedQuery.subscribeToMore(apolloOptions);
        } else {
          // Create observer
          this.observer = this.vm.$apollo.subscribe(apolloOptions); // Create subscription

          this.sub = this.observer.subscribe({
            next: this.nextResult.bind(this),
            error: this.catchError.bind(this)
          });
        }

        _get(_getPrototypeOf(SmartSubscription.prototype), "executeApollo", this).call(this, variables);
      }
    }, {
      key: "nextResult",
      value: function nextResult(data) {
        _get(_getPrototypeOf(SmartSubscription.prototype), "nextResult", this).call(this, data);

        if (typeof this.options.result === 'function') {
          this.options.result.call(this.vm, data, this.key);
        }
      }
    }]);

    return SmartSubscription;
  }(SmartApollo);

  var DollarApollo =
  /*#__PURE__*/
  function () {
    function DollarApollo(vm) {
      _classCallCheck(this, DollarApollo);

      this._apolloSubscriptions = [];
      this._watchers = [];
      this.vm = vm;
      this.queries = {};
      this.subscriptions = {};
      this.client = undefined;
      this.loadingKey = undefined;
      this.error = undefined;
    }

    _createClass(DollarApollo, [{
      key: "query",
      value: function query(options) {
        return this.getClient(options).query(options);
      }
    }, {
      key: "getClient",
      value: function getClient() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

        if (!options || !options.client) {
          if (_typeof(this.client) === 'object') {
            return this.client;
          }

          if (this.client) {
            if (!this.provider.clients) {
              throw new Error("[vue-apollo] Missing 'clients' options in 'apolloProvider'");
            } else {
              var _client = this.provider.clients[this.client];

              if (!_client) {
                throw new Error("[vue-apollo] Missing client '".concat(this.client, "' in 'apolloProvider'"));
              }

              return _client;
            }
          }

          return this.provider.defaultClient;
        }

        var client = this.provider.clients[options.client];

        if (!client) {
          throw new Error("[vue-apollo] Missing client '".concat(options.client, "' in 'apolloProvider'"));
        }

        return client;
      }
    }, {
      key: "watchQuery",
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
      key: "mutate",
      value: function mutate(options) {
        return this.getClient(options).mutate(options);
      }
    }, {
      key: "subscribe",
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
      key: "addSmartQuery",
      value: function addSmartQuery(key, options) {
        var _this3 = this;

        var finalOptions = utils_5(options, this.vm);
        var apollo = this.vm.$options.apollo;
        var defaultOptions = this.provider.defaultOptions;
        var $query;

        if (apollo && apollo.$query) {
          $query = apollo.$query;
        }

        if ((!apollo || !apollo.$query) && defaultOptions && defaultOptions.$query) {
          $query = defaultOptions.$query;
        }

        if ($query) {
          // Also replaces 'undefined' values
          for (var _key in $query) {
            if (typeof finalOptions[_key] === 'undefined') {
              finalOptions[_key] = $query[_key];
            }
          }
        }

        var smart = this.queries[key] = new SmartQuery(this.vm, key, finalOptions, false);

        if (!this.vm.$isServer || finalOptions.prefetch !== false) {
          smart.autostart();
        }

        if (!this.vm.$isServer) {
          var subs = finalOptions.subscribeToMore;

          if (subs) {
            if (Array.isArray(subs)) {
              subs.forEach(function (sub, index) {
                _this3.addSmartSubscription("".concat(key).concat(index), _objectSpread({}, sub, {
                  linkedQuery: smart
                }));
              });
            } else {
              this.addSmartSubscription(key, _objectSpread({}, subs, {
                linkedQuery: smart
              }));
            }
          }
        }

        return smart;
      }
    }, {
      key: "addSmartSubscription",
      value: function addSmartSubscription(key, options) {
        if (!this.vm.$isServer) {
          options = utils_5(options, this.vm);
          var smart = this.subscriptions[key] = new SmartSubscription(this.vm, key, options, false);
          smart.autostart();
          return smart;
        }
      }
    }, {
      key: "defineReactiveSetter",
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
      key: "destroy",
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
            if (!_iteratorNormalCompletion && _iterator["return"] != null) {
              _iterator["return"]();
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
      key: "provider",
      get: function get() {
        return this.vm.$apolloProvider;
      }
    }, {
      key: "loading",
      get: function get() {
        return this.vm.$data.$apolloData.loading !== 0;
      }
    }, {
      key: "data",
      get: function get() {
        return this.vm.$data.$apolloData.data;
      }
    }, {
      key: "skipAllQueries",
      set: function set(value) {
        for (var key in this.queries) {
          this.queries[key].skip = value;
        }
      }
    }, {
      key: "skipAllSubscriptions",
      set: function set(value) {
        for (var key in this.subscriptions) {
          this.subscriptions[key].skip = value;
        }
      }
    }, {
      key: "skipAll",
      set: function set(value) {
        this.skipAllQueries = value;
        this.skipAllSubscriptions = value;
      }
    }]);

    return DollarApollo;
  }();

  var ApolloProvider =
  /*#__PURE__*/
  function () {
    function ApolloProvider(options) {
      _classCallCheck(this, ApolloProvider);

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

    _createClass(ApolloProvider, [{
      key: "provide",
      value: function provide() {
        var key = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '$apolloProvider';
        console.warn("<ApolloProvider>.provide() is deprecated. Use the 'apolloProvider' option instead with the provider object directly.");
        return _defineProperty({}, key, this);
      }
    }]);

    return ApolloProvider;
  }();

  /**
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *
   * 
   */
  var nodejsCustomInspectSymbol = typeof Symbol === 'function' ? Symbol.for('nodejs.util.inspect.custom') : undefined;

  function _typeof$1(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof$1 = function _typeof(obj) { return typeof obj; }; } else { _typeof$1 = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof$1(obj); }
  var MAX_ARRAY_LENGTH = 10;
  var MAX_RECURSIVE_DEPTH = 2;
  /**
   * Used to print values in error messages.
   */

  function inspect(value) {
    return formatValue(value, []);
  }

  function formatValue(value, seenValues) {
    switch (_typeof$1(value)) {
      case 'string':
        return JSON.stringify(value);

      case 'function':
        return value.name ? "[function ".concat(value.name, "]") : '[function]';

      case 'object':
        return formatObjectValue(value, seenValues);

      default:
        return String(value);
    }
  }

  function formatObjectValue(value, previouslySeenValues) {
    if (previouslySeenValues.indexOf(value) !== -1) {
      return '[Circular]';
    }

    var seenValues = [].concat(previouslySeenValues, [value]);

    if (value) {
      var customInspectFn = getCustomFn(value);

      if (customInspectFn) {
        // $FlowFixMe(>=0.90.0)
        var customValue = customInspectFn.call(value); // check for infinite recursion

        if (customValue !== value) {
          return typeof customValue === 'string' ? customValue : formatValue(customValue, seenValues);
        }
      } else if (Array.isArray(value)) {
        return formatArray(value, seenValues);
      }

      return formatObject(value, seenValues);
    }

    return String(value);
  }

  function formatObject(object, seenValues) {
    var keys = Object.keys(object);

    if (keys.length === 0) {
      return '{}';
    }

    if (seenValues.length > MAX_RECURSIVE_DEPTH) {
      return '[' + getObjectTag(object) + ']';
    }

    var properties = keys.map(function (key) {
      var value = formatValue(object[key], seenValues);
      return key + ': ' + value;
    });
    return '{ ' + properties.join(', ') + ' }';
  }

  function formatArray(array, seenValues) {
    if (array.length === 0) {
      return '[]';
    }

    if (seenValues.length > MAX_RECURSIVE_DEPTH) {
      return '[Array]';
    }

    var len = Math.min(MAX_ARRAY_LENGTH, array.length);
    var remaining = array.length - len;
    var items = [];

    for (var i = 0; i < len; ++i) {
      items.push(formatValue(array[i], seenValues));
    }

    if (remaining === 1) {
      items.push('... 1 more item');
    } else if (remaining > 1) {
      items.push("... ".concat(remaining, " more items"));
    }

    return '[' + items.join(', ') + ']';
  }

  function getCustomFn(object) {
    var customInspectFn = object[String(nodejsCustomInspectSymbol)];

    if (typeof customInspectFn === 'function') {
      return customInspectFn;
    }

    if (typeof object.inspect === 'function') {
      return object.inspect;
    }
  }

  function getObjectTag(object) {
    var tag = Object.prototype.toString.call(object).replace(/^\[object /, '').replace(/]$/, '');

    if (tag === 'Object' && typeof object.constructor === 'function') {
      var name = object.constructor.name;

      if (typeof name === 'string') {
        return name;
      }
    }

    return tag;
  }

  /**
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *
   * 
   */
  /**
   * The `defineToJSON()` function defines toJSON() and inspect() prototype
   * methods, if no function provided they become aliases for toString().
   */

  function defineToJSON( // eslint-disable-next-line flowtype/no-weak-types
  classObject) {
    var fn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : classObject.prototype.toString;
    classObject.prototype.toJSON = fn;
    classObject.prototype.inspect = fn;

    if (nodejsCustomInspectSymbol) {
      classObject.prototype[nodejsCustomInspectSymbol] = fn;
    }
  }

  /**
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *
   * 
   */
  function invariant(condition, message) {
    /* istanbul ignore else */
    if (!condition) {
      throw new Error(message);
    }
  }

  /**
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *
   * 
   */

  /**
   * The `defineToStringTag()` function checks first to see if the runtime
   * supports the `Symbol` class and then if the `Symbol.toStringTag` constant
   * is defined as a `Symbol` instance. If both conditions are met, the
   * Symbol.toStringTag property is defined as a getter that returns the
   * supplied class constructor's name.
   *
   * @method defineToStringTag
   *
   * @param {Class<any>} classObject a class such as Object, String, Number but
   * typically one of your own creation through the class keyword; `class A {}`,
   * for example.
   */
  function defineToStringTag(classObject) {
    if (typeof Symbol === 'function' && Symbol.toStringTag) {
      Object.defineProperty(classObject.prototype, Symbol.toStringTag, {
        get: function get() {
          return this.constructor.name;
        }
      });
    }
  }

  /**
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *
   * 
   */

  /**
   * A representation of source input to GraphQL.
   * `name` and `locationOffset` are optional. They are useful for clients who
   * store GraphQL documents in source files; for example, if the GraphQL input
   * starts at line 40 in a file named Foo.graphql, it might be useful for name to
   * be "Foo.graphql" and location to be `{ line: 40, column: 0 }`.
   * line and column in locationOffset are 1-indexed
   */
  var Source = function Source(body, name, locationOffset) {
    this.body = body;
    this.name = name || 'GraphQL request';
    this.locationOffset = locationOffset || {
      line: 1,
      column: 1
    };
    !(this.locationOffset.line > 0) ? invariant(0, 'line in locationOffset is 1-indexed and must be positive') : void 0;
    !(this.locationOffset.column > 0) ? invariant(0, 'column in locationOffset is 1-indexed and must be positive') : void 0;
  }; // Conditionally apply `[Symbol.toStringTag]` if `Symbol`s are supported

  defineToStringTag(Source);

  /**
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *
   * 
   */

  /**
   * Represents a location in a Source.
   */

  /**
   * Takes a Source and a UTF-8 character offset, and returns the corresponding
   * line and column as a SourceLocation.
   */
  function getLocation(source, position) {
    var lineRegexp = /\r\n|[\n\r]/g;
    var line = 1;
    var column = position + 1;
    var match;

    while ((match = lineRegexp.exec(source.body)) && match.index < position) {
      line += 1;
      column = position + 1 - (match.index + match[0].length);
    }

    return {
      line: line,
      column: column
    };
  }

  /**
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *
   * 
   */

  /**
   * Prints a GraphQLError to a string, representing useful location information
   * about the error's position in the source.
   */
  function printError(error) {
    var printedLocations = [];

    if (error.nodes) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = error.nodes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var node = _step.value;

          if (node.loc) {
            printedLocations.push(highlightSourceAtLocation(node.loc.source, getLocation(node.loc.source, node.loc.start)));
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    } else if (error.source && error.locations) {
      var source = error.source;
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = error.locations[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var location = _step2.value;
          printedLocations.push(highlightSourceAtLocation(source, location));
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }
    }

    return printedLocations.length === 0 ? error.message : [error.message].concat(printedLocations).join('\n\n') + '\n';
  }
  /**
   * Render a helpful description of the location of the error in the GraphQL
   * Source document.
   */

  function highlightSourceAtLocation(source, location) {
    var firstLineColumnOffset = source.locationOffset.column - 1;
    var body = whitespace(firstLineColumnOffset) + source.body;
    var lineIndex = location.line - 1;
    var lineOffset = source.locationOffset.line - 1;
    var lineNum = location.line + lineOffset;
    var columnOffset = location.line === 1 ? firstLineColumnOffset : 0;
    var columnNum = location.column + columnOffset;
    var lines = body.split(/\r\n|[\n\r]/g);
    return "".concat(source.name, " (").concat(lineNum, ":").concat(columnNum, ")\n") + printPrefixedLines([// Lines specified like this: ["prefix", "string"],
    ["".concat(lineNum - 1, ": "), lines[lineIndex - 1]], ["".concat(lineNum, ": "), lines[lineIndex]], ['', whitespace(columnNum - 1) + '^'], ["".concat(lineNum + 1, ": "), lines[lineIndex + 1]]]);
  }

  function printPrefixedLines(lines) {
    var existingLines = lines.filter(function (_ref) {
      var _ = _ref[0],
          line = _ref[1];
      return line !== undefined;
    });
    var padLen = 0;
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = existingLines[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var _ref4 = _step3.value;
        var prefix = _ref4[0];
        padLen = Math.max(padLen, prefix.length);
      }
    } catch (err) {
      _didIteratorError3 = true;
      _iteratorError3 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
          _iterator3.return();
        }
      } finally {
        if (_didIteratorError3) {
          throw _iteratorError3;
        }
      }
    }

    return existingLines.map(function (_ref3) {
      var prefix = _ref3[0],
          line = _ref3[1];
      return lpad(padLen, prefix) + line;
    }).join('\n');
  }

  function whitespace(len) {
    return Array(len + 1).join(' ');
  }

  function lpad(len, str) {
    return whitespace(len - str.length) + str;
  }

  /**
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *
   * 
   */
  function GraphQLError( // eslint-disable-line no-redeclare
  message, nodes, source, positions, path, originalError, extensions) {
    // Compute list of blame nodes.
    var _nodes = Array.isArray(nodes) ? nodes.length !== 0 ? nodes : undefined : nodes ? [nodes] : undefined; // Compute locations in the source for the given nodes/positions.


    var _source = source;

    if (!_source && _nodes) {
      var node = _nodes[0];
      _source = node && node.loc && node.loc.source;
    }

    var _positions = positions;

    if (!_positions && _nodes) {
      _positions = _nodes.reduce(function (list, node) {
        if (node.loc) {
          list.push(node.loc.start);
        }

        return list;
      }, []);
    }

    if (_positions && _positions.length === 0) {
      _positions = undefined;
    }

    var _locations;

    if (positions && source) {
      _locations = positions.map(function (pos) {
        return getLocation(source, pos);
      });
    } else if (_nodes) {
      _locations = _nodes.reduce(function (list, node) {
        if (node.loc) {
          list.push(getLocation(node.loc.source, node.loc.start));
        }

        return list;
      }, []);
    }

    var _extensions = extensions || originalError && originalError.extensions;

    Object.defineProperties(this, {
      message: {
        value: message,
        // By being enumerable, JSON.stringify will include `message` in the
        // resulting output. This ensures that the simplest possible GraphQL
        // service adheres to the spec.
        enumerable: true,
        writable: true
      },
      locations: {
        // Coercing falsey values to undefined ensures they will not be included
        // in JSON.stringify() when not provided.
        value: _locations || undefined,
        // By being enumerable, JSON.stringify will include `locations` in the
        // resulting output. This ensures that the simplest possible GraphQL
        // service adheres to the spec.
        enumerable: Boolean(_locations)
      },
      path: {
        // Coercing falsey values to undefined ensures they will not be included
        // in JSON.stringify() when not provided.
        value: path || undefined,
        // By being enumerable, JSON.stringify will include `path` in the
        // resulting output. This ensures that the simplest possible GraphQL
        // service adheres to the spec.
        enumerable: Boolean(path)
      },
      nodes: {
        value: _nodes || undefined
      },
      source: {
        value: _source || undefined
      },
      positions: {
        value: _positions || undefined
      },
      originalError: {
        value: originalError
      },
      extensions: {
        // Coercing falsey values to undefined ensures they will not be included
        // in JSON.stringify() when not provided.
        value: _extensions || undefined,
        // By being enumerable, JSON.stringify will include `path` in the
        // resulting output. This ensures that the simplest possible GraphQL
        // service adheres to the spec.
        enumerable: Boolean(_extensions)
      }
    }); // Include (non-enumerable) stack trace.

    if (originalError && originalError.stack) {
      Object.defineProperty(this, 'stack', {
        value: originalError.stack,
        writable: true,
        configurable: true
      });
    } else if (Error.captureStackTrace) {
      Error.captureStackTrace(this, GraphQLError);
    } else {
      Object.defineProperty(this, 'stack', {
        value: Error().stack,
        writable: true,
        configurable: true
      });
    }
  }
  GraphQLError.prototype = Object.create(Error.prototype, {
    constructor: {
      value: GraphQLError
    },
    name: {
      value: 'GraphQLError'
    },
    toString: {
      value: function toString() {
        return printError(this);
      }
    }
  });

  /**
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *
   * 
   */
  /**
   * Produces a GraphQLError representing a syntax error, containing useful
   * descriptive information about the syntax error's position in the source.
   */

  function syntaxError(source, position, description) {
    return new GraphQLError("Syntax Error: ".concat(description), undefined, source, [position]);
  }

  /**
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *
   * 
   */

  /**
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *
   * 
   */

  /**
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *
   * 
   */

  /**
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *
   * 
   */

  /**
   * Produces the value of a block string from its parsed raw value, similar to
   * CoffeeScript's block string, Python's docstring trim or Ruby's strip_heredoc.
   *
   * This implements the GraphQL spec's BlockStringValue() static algorithm.
   */
  function dedentBlockStringValue(rawString) {
    // Expand a block string's raw value into independent lines.
    var lines = rawString.split(/\r\n|[\n\r]/g); // Remove common indentation from all lines but first.

    var commonIndent = null;

    for (var i = 1; i < lines.length; i++) {
      var line = lines[i];
      var indent = leadingWhitespace(line);

      if (indent < line.length && (commonIndent === null || indent < commonIndent)) {
        commonIndent = indent;

        if (commonIndent === 0) {
          break;
        }
      }
    }

    if (commonIndent) {
      for (var _i = 1; _i < lines.length; _i++) {
        lines[_i] = lines[_i].slice(commonIndent);
      }
    } // Remove leading and trailing blank lines.


    while (lines.length > 0 && isBlank(lines[0])) {
      lines.shift();
    }

    while (lines.length > 0 && isBlank(lines[lines.length - 1])) {
      lines.pop();
    } // Return a string of the lines joined with U+000A.


    return lines.join('\n');
  }

  function leadingWhitespace(str) {
    var i = 0;

    while (i < str.length && (str[i] === ' ' || str[i] === '\t')) {
      i++;
    }

    return i;
  }

  function isBlank(str) {
    return leadingWhitespace(str) === str.length;
  }

  /**
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *
   * 
   */
  /**
   * Given a Source object, this returns a Lexer for that source.
   * A Lexer is a stateful stream generator in that every time
   * it is advanced, it returns the next token in the Source. Assuming the
   * source lexes, the final Token emitted by the lexer will be of kind
   * EOF, after which the lexer will repeatedly return the same EOF token
   * whenever called.
   */

  function createLexer(source, options) {
    var startOfFileToken = new Tok(TokenKind.SOF, 0, 0, 0, 0, null);
    var lexer = {
      source: source,
      options: options,
      lastToken: startOfFileToken,
      token: startOfFileToken,
      line: 1,
      lineStart: 0,
      advance: advanceLexer,
      lookahead: lookahead
    };
    return lexer;
  }

  function advanceLexer() {
    this.lastToken = this.token;
    var token = this.token = this.lookahead();
    return token;
  }

  function lookahead() {
    var token = this.token;

    if (token.kind !== TokenKind.EOF) {
      do {
        // Note: next is only mutable during parsing, so we cast to allow this.
        token = token.next || (token.next = readToken(this, token));
      } while (token.kind === TokenKind.COMMENT);
    }

    return token;
  }
  /**
   * The return type of createLexer.
   */


  /**
   * An exported enum describing the different kinds of tokens that the
   * lexer emits.
   */
  var TokenKind = Object.freeze({
    SOF: '<SOF>',
    EOF: '<EOF>',
    BANG: '!',
    DOLLAR: '$',
    AMP: '&',
    PAREN_L: '(',
    PAREN_R: ')',
    SPREAD: '...',
    COLON: ':',
    EQUALS: '=',
    AT: '@',
    BRACKET_L: '[',
    BRACKET_R: ']',
    BRACE_L: '{',
    PIPE: '|',
    BRACE_R: '}',
    NAME: 'Name',
    INT: 'Int',
    FLOAT: 'Float',
    STRING: 'String',
    BLOCK_STRING: 'BlockString',
    COMMENT: 'Comment'
  });
  /**
   * The enum type representing the token kinds values.
   */

  /**
   * A helper function to describe a token as a string for debugging
   */
  function getTokenDesc(token) {
    var value = token.value;
    return value ? "".concat(token.kind, " \"").concat(value, "\"") : token.kind;
  }
  /**
   * Helper function for constructing the Token object.
   */

  function Tok(kind, start, end, line, column, prev, value) {
    this.kind = kind;
    this.start = start;
    this.end = end;
    this.line = line;
    this.column = column;
    this.value = value;
    this.prev = prev;
    this.next = null;
  } // Print a simplified form when appearing in JSON/util.inspect.


  defineToJSON(Tok, function () {
    return {
      kind: this.kind,
      value: this.value,
      line: this.line,
      column: this.column
    };
  });

  function printCharCode(code) {
    return (// NaN/undefined represents access beyond the end of the file.
      isNaN(code) ? TokenKind.EOF : // Trust JSON for ASCII.
      code < 0x007f ? JSON.stringify(String.fromCharCode(code)) : // Otherwise print the escaped form.
      "\"\\u".concat(('00' + code.toString(16).toUpperCase()).slice(-4), "\"")
    );
  }
  /**
   * Gets the next token from the source starting at the given position.
   *
   * This skips over whitespace until it finds the next lexable token, then lexes
   * punctuators immediately or calls the appropriate helper function for more
   * complicated tokens.
   */


  function readToken(lexer, prev) {
    var source = lexer.source;
    var body = source.body;
    var bodyLength = body.length;
    var pos = positionAfterWhitespace(body, prev.end, lexer);
    var line = lexer.line;
    var col = 1 + pos - lexer.lineStart;

    if (pos >= bodyLength) {
      return new Tok(TokenKind.EOF, bodyLength, bodyLength, line, col, prev);
    }

    var code = body.charCodeAt(pos); // SourceCharacter

    switch (code) {
      // !
      case 33:
        return new Tok(TokenKind.BANG, pos, pos + 1, line, col, prev);
      // #

      case 35:
        return readComment(source, pos, line, col, prev);
      // $

      case 36:
        return new Tok(TokenKind.DOLLAR, pos, pos + 1, line, col, prev);
      // &

      case 38:
        return new Tok(TokenKind.AMP, pos, pos + 1, line, col, prev);
      // (

      case 40:
        return new Tok(TokenKind.PAREN_L, pos, pos + 1, line, col, prev);
      // )

      case 41:
        return new Tok(TokenKind.PAREN_R, pos, pos + 1, line, col, prev);
      // .

      case 46:
        if (body.charCodeAt(pos + 1) === 46 && body.charCodeAt(pos + 2) === 46) {
          return new Tok(TokenKind.SPREAD, pos, pos + 3, line, col, prev);
        }

        break;
      // :

      case 58:
        return new Tok(TokenKind.COLON, pos, pos + 1, line, col, prev);
      // =

      case 61:
        return new Tok(TokenKind.EQUALS, pos, pos + 1, line, col, prev);
      // @

      case 64:
        return new Tok(TokenKind.AT, pos, pos + 1, line, col, prev);
      // [

      case 91:
        return new Tok(TokenKind.BRACKET_L, pos, pos + 1, line, col, prev);
      // ]

      case 93:
        return new Tok(TokenKind.BRACKET_R, pos, pos + 1, line, col, prev);
      // {

      case 123:
        return new Tok(TokenKind.BRACE_L, pos, pos + 1, line, col, prev);
      // |

      case 124:
        return new Tok(TokenKind.PIPE, pos, pos + 1, line, col, prev);
      // }

      case 125:
        return new Tok(TokenKind.BRACE_R, pos, pos + 1, line, col, prev);
      // A-Z _ a-z

      case 65:
      case 66:
      case 67:
      case 68:
      case 69:
      case 70:
      case 71:
      case 72:
      case 73:
      case 74:
      case 75:
      case 76:
      case 77:
      case 78:
      case 79:
      case 80:
      case 81:
      case 82:
      case 83:
      case 84:
      case 85:
      case 86:
      case 87:
      case 88:
      case 89:
      case 90:
      case 95:
      case 97:
      case 98:
      case 99:
      case 100:
      case 101:
      case 102:
      case 103:
      case 104:
      case 105:
      case 106:
      case 107:
      case 108:
      case 109:
      case 110:
      case 111:
      case 112:
      case 113:
      case 114:
      case 115:
      case 116:
      case 117:
      case 118:
      case 119:
      case 120:
      case 121:
      case 122:
        return readName(source, pos, line, col, prev);
      // - 0-9

      case 45:
      case 48:
      case 49:
      case 50:
      case 51:
      case 52:
      case 53:
      case 54:
      case 55:
      case 56:
      case 57:
        return readNumber(source, pos, code, line, col, prev);
      // "

      case 34:
        if (body.charCodeAt(pos + 1) === 34 && body.charCodeAt(pos + 2) === 34) {
          return readBlockString(source, pos, line, col, prev, lexer);
        }

        return readString(source, pos, line, col, prev);
    }

    throw syntaxError(source, pos, unexpectedCharacterMessage(code));
  }
  /**
   * Report a message that an unexpected character was encountered.
   */


  function unexpectedCharacterMessage(code) {
    if (code < 0x0020 && code !== 0x0009 && code !== 0x000a && code !== 0x000d) {
      return "Cannot contain the invalid character ".concat(printCharCode(code), ".");
    }

    if (code === 39) {
      // '
      return "Unexpected single quote character ('), did you mean to use " + 'a double quote (")?';
    }

    return "Cannot parse the unexpected character ".concat(printCharCode(code), ".");
  }
  /**
   * Reads from body starting at startPosition until it finds a non-whitespace
   * character, then returns the position of that character for lexing.
   */


  function positionAfterWhitespace(body, startPosition, lexer) {
    var bodyLength = body.length;
    var position = startPosition;

    while (position < bodyLength) {
      var code = body.charCodeAt(position); // tab | space | comma | BOM

      if (code === 9 || code === 32 || code === 44 || code === 0xfeff) {
        ++position;
      } else if (code === 10) {
        // new line
        ++position;
        ++lexer.line;
        lexer.lineStart = position;
      } else if (code === 13) {
        // carriage return
        if (body.charCodeAt(position + 1) === 10) {
          position += 2;
        } else {
          ++position;
        }

        ++lexer.line;
        lexer.lineStart = position;
      } else {
        break;
      }
    }

    return position;
  }
  /**
   * Reads a comment token from the source file.
   *
   * #[\u0009\u0020-\uFFFF]*
   */


  function readComment(source, start, line, col, prev) {
    var body = source.body;
    var code;
    var position = start;

    do {
      code = body.charCodeAt(++position);
    } while (!isNaN(code) && ( // SourceCharacter but not LineTerminator
    code > 0x001f || code === 0x0009));

    return new Tok(TokenKind.COMMENT, start, position, line, col, prev, body.slice(start + 1, position));
  }
  /**
   * Reads a number token from the source file, either a float
   * or an int depending on whether a decimal point appears.
   *
   * Int:   -?(0|[1-9][0-9]*)
   * Float: -?(0|[1-9][0-9]*)(\.[0-9]+)?((E|e)(+|-)?[0-9]+)?
   */


  function readNumber(source, start, firstCode, line, col, prev) {
    var body = source.body;
    var code = firstCode;
    var position = start;
    var isFloat = false;

    if (code === 45) {
      // -
      code = body.charCodeAt(++position);
    }

    if (code === 48) {
      // 0
      code = body.charCodeAt(++position);

      if (code >= 48 && code <= 57) {
        throw syntaxError(source, position, "Invalid number, unexpected digit after 0: ".concat(printCharCode(code), "."));
      }
    } else {
      position = readDigits(source, position, code);
      code = body.charCodeAt(position);
    }

    if (code === 46) {
      // .
      isFloat = true;
      code = body.charCodeAt(++position);
      position = readDigits(source, position, code);
      code = body.charCodeAt(position);
    }

    if (code === 69 || code === 101) {
      // E e
      isFloat = true;
      code = body.charCodeAt(++position);

      if (code === 43 || code === 45) {
        // + -
        code = body.charCodeAt(++position);
      }

      position = readDigits(source, position, code);
    }

    return new Tok(isFloat ? TokenKind.FLOAT : TokenKind.INT, start, position, line, col, prev, body.slice(start, position));
  }
  /**
   * Returns the new position in the source after reading digits.
   */


  function readDigits(source, start, firstCode) {
    var body = source.body;
    var position = start;
    var code = firstCode;

    if (code >= 48 && code <= 57) {
      // 0 - 9
      do {
        code = body.charCodeAt(++position);
      } while (code >= 48 && code <= 57); // 0 - 9


      return position;
    }

    throw syntaxError(source, position, "Invalid number, expected digit but got: ".concat(printCharCode(code), "."));
  }
  /**
   * Reads a string token from the source file.
   *
   * "([^"\\\u000A\u000D]|(\\(u[0-9a-fA-F]{4}|["\\/bfnrt])))*"
   */


  function readString(source, start, line, col, prev) {
    var body = source.body;
    var position = start + 1;
    var chunkStart = position;
    var code = 0;
    var value = '';

    while (position < body.length && !isNaN(code = body.charCodeAt(position)) && // not LineTerminator
    code !== 0x000a && code !== 0x000d) {
      // Closing Quote (")
      if (code === 34) {
        value += body.slice(chunkStart, position);
        return new Tok(TokenKind.STRING, start, position + 1, line, col, prev, value);
      } // SourceCharacter


      if (code < 0x0020 && code !== 0x0009) {
        throw syntaxError(source, position, "Invalid character within String: ".concat(printCharCode(code), "."));
      }

      ++position;

      if (code === 92) {
        // \
        value += body.slice(chunkStart, position - 1);
        code = body.charCodeAt(position);

        switch (code) {
          case 34:
            value += '"';
            break;

          case 47:
            value += '/';
            break;

          case 92:
            value += '\\';
            break;

          case 98:
            value += '\b';
            break;

          case 102:
            value += '\f';
            break;

          case 110:
            value += '\n';
            break;

          case 114:
            value += '\r';
            break;

          case 116:
            value += '\t';
            break;

          case 117:
            // u
            var charCode = uniCharCode(body.charCodeAt(position + 1), body.charCodeAt(position + 2), body.charCodeAt(position + 3), body.charCodeAt(position + 4));

            if (charCode < 0) {
              throw syntaxError(source, position, 'Invalid character escape sequence: ' + "\\u".concat(body.slice(position + 1, position + 5), "."));
            }

            value += String.fromCharCode(charCode);
            position += 4;
            break;

          default:
            throw syntaxError(source, position, "Invalid character escape sequence: \\".concat(String.fromCharCode(code), "."));
        }

        ++position;
        chunkStart = position;
      }
    }

    throw syntaxError(source, position, 'Unterminated string.');
  }
  /**
   * Reads a block string token from the source file.
   *
   * """("?"?(\\"""|\\(?!=""")|[^"\\]))*"""
   */


  function readBlockString(source, start, line, col, prev, lexer) {
    var body = source.body;
    var position = start + 3;
    var chunkStart = position;
    var code = 0;
    var rawValue = '';

    while (position < body.length && !isNaN(code = body.charCodeAt(position))) {
      // Closing Triple-Quote (""")
      if (code === 34 && body.charCodeAt(position + 1) === 34 && body.charCodeAt(position + 2) === 34) {
        rawValue += body.slice(chunkStart, position);
        return new Tok(TokenKind.BLOCK_STRING, start, position + 3, line, col, prev, dedentBlockStringValue(rawValue));
      } // SourceCharacter


      if (code < 0x0020 && code !== 0x0009 && code !== 0x000a && code !== 0x000d) {
        throw syntaxError(source, position, "Invalid character within String: ".concat(printCharCode(code), "."));
      }

      if (code === 10) {
        // new line
        ++position;
        ++lexer.line;
        lexer.lineStart = position;
      } else if (code === 13) {
        // carriage return
        if (body.charCodeAt(position + 1) === 10) {
          position += 2;
        } else {
          ++position;
        }

        ++lexer.line;
        lexer.lineStart = position;
      } else if ( // Escape Triple-Quote (\""")
      code === 92 && body.charCodeAt(position + 1) === 34 && body.charCodeAt(position + 2) === 34 && body.charCodeAt(position + 3) === 34) {
        rawValue += body.slice(chunkStart, position) + '"""';
        position += 4;
        chunkStart = position;
      } else {
        ++position;
      }
    }

    throw syntaxError(source, position, 'Unterminated string.');
  }
  /**
   * Converts four hexadecimal chars to the integer that the
   * string represents. For example, uniCharCode('0','0','0','f')
   * will return 15, and uniCharCode('0','0','f','f') returns 255.
   *
   * Returns a negative number on error, if a char was invalid.
   *
   * This is implemented by noting that char2hex() returns -1 on error,
   * which means the result of ORing the char2hex() will also be negative.
   */


  function uniCharCode(a, b, c, d) {
    return char2hex(a) << 12 | char2hex(b) << 8 | char2hex(c) << 4 | char2hex(d);
  }
  /**
   * Converts a hex character to its integer value.
   * '0' becomes 0, '9' becomes 9
   * 'A' becomes 10, 'F' becomes 15
   * 'a' becomes 10, 'f' becomes 15
   *
   * Returns -1 on error.
   */


  function char2hex(a) {
    return a >= 48 && a <= 57 ? a - 48 // 0-9
    : a >= 65 && a <= 70 ? a - 55 // A-F
    : a >= 97 && a <= 102 ? a - 87 // a-f
    : -1;
  }
  /**
   * Reads an alphanumeric + underscore name from the source.
   *
   * [_A-Za-z][_0-9A-Za-z]*
   */


  function readName(source, start, line, col, prev) {
    var body = source.body;
    var bodyLength = body.length;
    var position = start + 1;
    var code = 0;

    while (position !== bodyLength && !isNaN(code = body.charCodeAt(position)) && (code === 95 || // _
    code >= 48 && code <= 57 || // 0-9
    code >= 65 && code <= 90 || // A-Z
    code >= 97 && code <= 122) // a-z
    ) {
      ++position;
    }

    return new Tok(TokenKind.NAME, start, position, line, col, prev, body.slice(start, position));
  }

  /**
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *
   * 
   */

  /**
   * The set of allowed kind values for AST nodes.
   */
  var Kind = Object.freeze({
    // Name
    NAME: 'Name',
    // Document
    DOCUMENT: 'Document',
    OPERATION_DEFINITION: 'OperationDefinition',
    VARIABLE_DEFINITION: 'VariableDefinition',
    SELECTION_SET: 'SelectionSet',
    FIELD: 'Field',
    ARGUMENT: 'Argument',
    // Fragments
    FRAGMENT_SPREAD: 'FragmentSpread',
    INLINE_FRAGMENT: 'InlineFragment',
    FRAGMENT_DEFINITION: 'FragmentDefinition',
    // Values
    VARIABLE: 'Variable',
    INT: 'IntValue',
    FLOAT: 'FloatValue',
    STRING: 'StringValue',
    BOOLEAN: 'BooleanValue',
    NULL: 'NullValue',
    ENUM: 'EnumValue',
    LIST: 'ListValue',
    OBJECT: 'ObjectValue',
    OBJECT_FIELD: 'ObjectField',
    // Directives
    DIRECTIVE: 'Directive',
    // Types
    NAMED_TYPE: 'NamedType',
    LIST_TYPE: 'ListType',
    NON_NULL_TYPE: 'NonNullType',
    // Type System Definitions
    SCHEMA_DEFINITION: 'SchemaDefinition',
    OPERATION_TYPE_DEFINITION: 'OperationTypeDefinition',
    // Type Definitions
    SCALAR_TYPE_DEFINITION: 'ScalarTypeDefinition',
    OBJECT_TYPE_DEFINITION: 'ObjectTypeDefinition',
    FIELD_DEFINITION: 'FieldDefinition',
    INPUT_VALUE_DEFINITION: 'InputValueDefinition',
    INTERFACE_TYPE_DEFINITION: 'InterfaceTypeDefinition',
    UNION_TYPE_DEFINITION: 'UnionTypeDefinition',
    ENUM_TYPE_DEFINITION: 'EnumTypeDefinition',
    ENUM_VALUE_DEFINITION: 'EnumValueDefinition',
    INPUT_OBJECT_TYPE_DEFINITION: 'InputObjectTypeDefinition',
    // Directive Definitions
    DIRECTIVE_DEFINITION: 'DirectiveDefinition',
    // Type System Extensions
    SCHEMA_EXTENSION: 'SchemaExtension',
    // Type Extensions
    SCALAR_TYPE_EXTENSION: 'ScalarTypeExtension',
    OBJECT_TYPE_EXTENSION: 'ObjectTypeExtension',
    INTERFACE_TYPE_EXTENSION: 'InterfaceTypeExtension',
    UNION_TYPE_EXTENSION: 'UnionTypeExtension',
    ENUM_TYPE_EXTENSION: 'EnumTypeExtension',
    INPUT_OBJECT_TYPE_EXTENSION: 'InputObjectTypeExtension'
  });
  /**
   * The enum type representing the possible kind values of AST nodes.
   */

  /**
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *
   * 
   */

  /**
   * The set of allowed directive location values.
   */
  var DirectiveLocation = Object.freeze({
    // Request Definitions
    QUERY: 'QUERY',
    MUTATION: 'MUTATION',
    SUBSCRIPTION: 'SUBSCRIPTION',
    FIELD: 'FIELD',
    FRAGMENT_DEFINITION: 'FRAGMENT_DEFINITION',
    FRAGMENT_SPREAD: 'FRAGMENT_SPREAD',
    INLINE_FRAGMENT: 'INLINE_FRAGMENT',
    VARIABLE_DEFINITION: 'VARIABLE_DEFINITION',
    // Type System Definitions
    SCHEMA: 'SCHEMA',
    SCALAR: 'SCALAR',
    OBJECT: 'OBJECT',
    FIELD_DEFINITION: 'FIELD_DEFINITION',
    ARGUMENT_DEFINITION: 'ARGUMENT_DEFINITION',
    INTERFACE: 'INTERFACE',
    UNION: 'UNION',
    ENUM: 'ENUM',
    ENUM_VALUE: 'ENUM_VALUE',
    INPUT_OBJECT: 'INPUT_OBJECT',
    INPUT_FIELD_DEFINITION: 'INPUT_FIELD_DEFINITION'
  });
  /**
   * The enum type representing the directive location values.
   */

  /**
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *
   * 
   */
  /**
   * Configuration options to control parser behavior
   */

  /**
   * Given a GraphQL source, parses it into a Document.
   * Throws GraphQLError if a syntax error is encountered.
   */
  function parse(source, options) {
    var sourceObj = typeof source === 'string' ? new Source(source) : source;

    if (!(sourceObj instanceof Source)) {
      throw new TypeError("Must provide Source. Received: ".concat(inspect(sourceObj)));
    }

    var lexer = createLexer(sourceObj, options || {});
    return parseDocument(lexer);
  }
  /**
   * Given a string containing a GraphQL value (ex. `[42]`), parse the AST for
   * that value.
   * Throws GraphQLError if a syntax error is encountered.
   *
   * This is useful within tools that operate upon GraphQL Values directly and
   * in isolation of complete GraphQL documents.
   *
   * Consider providing the results to the utility function: valueFromAST().
   */

  function parseValue(source, options) {
    var sourceObj = typeof source === 'string' ? new Source(source) : source;
    var lexer = createLexer(sourceObj, options || {});
    expectToken(lexer, TokenKind.SOF);
    var value = parseValueLiteral(lexer, false);
    expectToken(lexer, TokenKind.EOF);
    return value;
  }
  /**
   * Given a string containing a GraphQL Type (ex. `[Int!]`), parse the AST for
   * that type.
   * Throws GraphQLError if a syntax error is encountered.
   *
   * This is useful within tools that operate upon GraphQL Types directly and
   * in isolation of complete GraphQL documents.
   *
   * Consider providing the results to the utility function: typeFromAST().
   */

  function parseType(source, options) {
    var sourceObj = typeof source === 'string' ? new Source(source) : source;
    var lexer = createLexer(sourceObj, options || {});
    expectToken(lexer, TokenKind.SOF);
    var type = parseTypeReference(lexer);
    expectToken(lexer, TokenKind.EOF);
    return type;
  }
  /**
   * Converts a name lex token into a name parse node.
   */

  function parseName(lexer) {
    var token = expectToken(lexer, TokenKind.NAME);
    return {
      kind: Kind.NAME,
      value: token.value,
      loc: loc(lexer, token)
    };
  } // Implements the parsing rules in the Document section.

  /**
   * Document : Definition+
   */


  function parseDocument(lexer) {
    var start = lexer.token;
    return {
      kind: Kind.DOCUMENT,
      definitions: many(lexer, TokenKind.SOF, parseDefinition, TokenKind.EOF),
      loc: loc(lexer, start)
    };
  }
  /**
   * Definition :
   *   - ExecutableDefinition
   *   - TypeSystemDefinition
   *   - TypeSystemExtension
   */


  function parseDefinition(lexer) {
    if (peek(lexer, TokenKind.NAME)) {
      switch (lexer.token.value) {
        case 'query':
        case 'mutation':
        case 'subscription':
        case 'fragment':
          return parseExecutableDefinition(lexer);

        case 'schema':
        case 'scalar':
        case 'type':
        case 'interface':
        case 'union':
        case 'enum':
        case 'input':
        case 'directive':
          return parseTypeSystemDefinition(lexer);

        case 'extend':
          return parseTypeSystemExtension(lexer);
      }
    } else if (peek(lexer, TokenKind.BRACE_L)) {
      return parseExecutableDefinition(lexer);
    } else if (peekDescription(lexer)) {
      return parseTypeSystemDefinition(lexer);
    }

    throw unexpected(lexer);
  }
  /**
   * ExecutableDefinition :
   *   - OperationDefinition
   *   - FragmentDefinition
   */


  function parseExecutableDefinition(lexer) {
    if (peek(lexer, TokenKind.NAME)) {
      switch (lexer.token.value) {
        case 'query':
        case 'mutation':
        case 'subscription':
          return parseOperationDefinition(lexer);

        case 'fragment':
          return parseFragmentDefinition(lexer);
      }
    } else if (peek(lexer, TokenKind.BRACE_L)) {
      return parseOperationDefinition(lexer);
    }

    throw unexpected(lexer);
  } // Implements the parsing rules in the Operations section.

  /**
   * OperationDefinition :
   *  - SelectionSet
   *  - OperationType Name? VariableDefinitions? Directives? SelectionSet
   */


  function parseOperationDefinition(lexer) {
    var start = lexer.token;

    if (peek(lexer, TokenKind.BRACE_L)) {
      return {
        kind: Kind.OPERATION_DEFINITION,
        operation: 'query',
        name: undefined,
        variableDefinitions: [],
        directives: [],
        selectionSet: parseSelectionSet(lexer),
        loc: loc(lexer, start)
      };
    }

    var operation = parseOperationType(lexer);
    var name;

    if (peek(lexer, TokenKind.NAME)) {
      name = parseName(lexer);
    }

    return {
      kind: Kind.OPERATION_DEFINITION,
      operation: operation,
      name: name,
      variableDefinitions: parseVariableDefinitions(lexer),
      directives: parseDirectives(lexer, false),
      selectionSet: parseSelectionSet(lexer),
      loc: loc(lexer, start)
    };
  }
  /**
   * OperationType : one of query mutation subscription
   */


  function parseOperationType(lexer) {
    var operationToken = expectToken(lexer, TokenKind.NAME);

    switch (operationToken.value) {
      case 'query':
        return 'query';

      case 'mutation':
        return 'mutation';

      case 'subscription':
        return 'subscription';
    }

    throw unexpected(lexer, operationToken);
  }
  /**
   * VariableDefinitions : ( VariableDefinition+ )
   */


  function parseVariableDefinitions(lexer) {
    return peek(lexer, TokenKind.PAREN_L) ? many(lexer, TokenKind.PAREN_L, parseVariableDefinition, TokenKind.PAREN_R) : [];
  }
  /**
   * VariableDefinition : Variable : Type DefaultValue? Directives[Const]?
   */


  function parseVariableDefinition(lexer) {
    var start = lexer.token;
    return {
      kind: Kind.VARIABLE_DEFINITION,
      variable: parseVariable(lexer),
      type: (expectToken(lexer, TokenKind.COLON), parseTypeReference(lexer)),
      defaultValue: expectOptionalToken(lexer, TokenKind.EQUALS) ? parseValueLiteral(lexer, true) : undefined,
      directives: parseDirectives(lexer, true),
      loc: loc(lexer, start)
    };
  }
  /**
   * Variable : $ Name
   */


  function parseVariable(lexer) {
    var start = lexer.token;
    expectToken(lexer, TokenKind.DOLLAR);
    return {
      kind: Kind.VARIABLE,
      name: parseName(lexer),
      loc: loc(lexer, start)
    };
  }
  /**
   * SelectionSet : { Selection+ }
   */


  function parseSelectionSet(lexer) {
    var start = lexer.token;
    return {
      kind: Kind.SELECTION_SET,
      selections: many(lexer, TokenKind.BRACE_L, parseSelection, TokenKind.BRACE_R),
      loc: loc(lexer, start)
    };
  }
  /**
   * Selection :
   *   - Field
   *   - FragmentSpread
   *   - InlineFragment
   */


  function parseSelection(lexer) {
    return peek(lexer, TokenKind.SPREAD) ? parseFragment(lexer) : parseField(lexer);
  }
  /**
   * Field : Alias? Name Arguments? Directives? SelectionSet?
   *
   * Alias : Name :
   */


  function parseField(lexer) {
    var start = lexer.token;
    var nameOrAlias = parseName(lexer);
    var alias;
    var name;

    if (expectOptionalToken(lexer, TokenKind.COLON)) {
      alias = nameOrAlias;
      name = parseName(lexer);
    } else {
      name = nameOrAlias;
    }

    return {
      kind: Kind.FIELD,
      alias: alias,
      name: name,
      arguments: parseArguments(lexer, false),
      directives: parseDirectives(lexer, false),
      selectionSet: peek(lexer, TokenKind.BRACE_L) ? parseSelectionSet(lexer) : undefined,
      loc: loc(lexer, start)
    };
  }
  /**
   * Arguments[Const] : ( Argument[?Const]+ )
   */


  function parseArguments(lexer, isConst) {
    var item = isConst ? parseConstArgument : parseArgument;
    return peek(lexer, TokenKind.PAREN_L) ? many(lexer, TokenKind.PAREN_L, item, TokenKind.PAREN_R) : [];
  }
  /**
   * Argument[Const] : Name : Value[?Const]
   */


  function parseArgument(lexer) {
    var start = lexer.token;
    var name = parseName(lexer);
    expectToken(lexer, TokenKind.COLON);
    return {
      kind: Kind.ARGUMENT,
      name: name,
      value: parseValueLiteral(lexer, false),
      loc: loc(lexer, start)
    };
  }

  function parseConstArgument(lexer) {
    var start = lexer.token;
    return {
      kind: Kind.ARGUMENT,
      name: parseName(lexer),
      value: (expectToken(lexer, TokenKind.COLON), parseConstValue(lexer)),
      loc: loc(lexer, start)
    };
  } // Implements the parsing rules in the Fragments section.

  /**
   * Corresponds to both FragmentSpread and InlineFragment in the spec.
   *
   * FragmentSpread : ... FragmentName Directives?
   *
   * InlineFragment : ... TypeCondition? Directives? SelectionSet
   */


  function parseFragment(lexer) {
    var start = lexer.token;
    expectToken(lexer, TokenKind.SPREAD);
    var hasTypeCondition = expectOptionalKeyword(lexer, 'on');

    if (!hasTypeCondition && peek(lexer, TokenKind.NAME)) {
      return {
        kind: Kind.FRAGMENT_SPREAD,
        name: parseFragmentName(lexer),
        directives: parseDirectives(lexer, false),
        loc: loc(lexer, start)
      };
    }

    return {
      kind: Kind.INLINE_FRAGMENT,
      typeCondition: hasTypeCondition ? parseNamedType(lexer) : undefined,
      directives: parseDirectives(lexer, false),
      selectionSet: parseSelectionSet(lexer),
      loc: loc(lexer, start)
    };
  }
  /**
   * FragmentDefinition :
   *   - fragment FragmentName on TypeCondition Directives? SelectionSet
   *
   * TypeCondition : NamedType
   */


  function parseFragmentDefinition(lexer) {
    var start = lexer.token;
    expectKeyword(lexer, 'fragment'); // Experimental support for defining variables within fragments changes
    // the grammar of FragmentDefinition:
    //   - fragment FragmentName VariableDefinitions? on TypeCondition Directives? SelectionSet

    if (lexer.options.experimentalFragmentVariables) {
      return {
        kind: Kind.FRAGMENT_DEFINITION,
        name: parseFragmentName(lexer),
        variableDefinitions: parseVariableDefinitions(lexer),
        typeCondition: (expectKeyword(lexer, 'on'), parseNamedType(lexer)),
        directives: parseDirectives(lexer, false),
        selectionSet: parseSelectionSet(lexer),
        loc: loc(lexer, start)
      };
    }

    return {
      kind: Kind.FRAGMENT_DEFINITION,
      name: parseFragmentName(lexer),
      typeCondition: (expectKeyword(lexer, 'on'), parseNamedType(lexer)),
      directives: parseDirectives(lexer, false),
      selectionSet: parseSelectionSet(lexer),
      loc: loc(lexer, start)
    };
  }
  /**
   * FragmentName : Name but not `on`
   */


  function parseFragmentName(lexer) {
    if (lexer.token.value === 'on') {
      throw unexpected(lexer);
    }

    return parseName(lexer);
  } // Implements the parsing rules in the Values section.

  /**
   * Value[Const] :
   *   - [~Const] Variable
   *   - IntValue
   *   - FloatValue
   *   - StringValue
   *   - BooleanValue
   *   - NullValue
   *   - EnumValue
   *   - ListValue[?Const]
   *   - ObjectValue[?Const]
   *
   * BooleanValue : one of `true` `false`
   *
   * NullValue : `null`
   *
   * EnumValue : Name but not `true`, `false` or `null`
   */


  function parseValueLiteral(lexer, isConst) {
    var token = lexer.token;

    switch (token.kind) {
      case TokenKind.BRACKET_L:
        return parseList(lexer, isConst);

      case TokenKind.BRACE_L:
        return parseObject(lexer, isConst);

      case TokenKind.INT:
        lexer.advance();
        return {
          kind: Kind.INT,
          value: token.value,
          loc: loc(lexer, token)
        };

      case TokenKind.FLOAT:
        lexer.advance();
        return {
          kind: Kind.FLOAT,
          value: token.value,
          loc: loc(lexer, token)
        };

      case TokenKind.STRING:
      case TokenKind.BLOCK_STRING:
        return parseStringLiteral(lexer);

      case TokenKind.NAME:
        if (token.value === 'true' || token.value === 'false') {
          lexer.advance();
          return {
            kind: Kind.BOOLEAN,
            value: token.value === 'true',
            loc: loc(lexer, token)
          };
        } else if (token.value === 'null') {
          lexer.advance();
          return {
            kind: Kind.NULL,
            loc: loc(lexer, token)
          };
        }

        lexer.advance();
        return {
          kind: Kind.ENUM,
          value: token.value,
          loc: loc(lexer, token)
        };

      case TokenKind.DOLLAR:
        if (!isConst) {
          return parseVariable(lexer);
        }

        break;
    }

    throw unexpected(lexer);
  }

  function parseStringLiteral(lexer) {
    var token = lexer.token;
    lexer.advance();
    return {
      kind: Kind.STRING,
      value: token.value,
      block: token.kind === TokenKind.BLOCK_STRING,
      loc: loc(lexer, token)
    };
  }

  function parseConstValue(lexer) {
    return parseValueLiteral(lexer, true);
  }

  function parseValueValue(lexer) {
    return parseValueLiteral(lexer, false);
  }
  /**
   * ListValue[Const] :
   *   - [ ]
   *   - [ Value[?Const]+ ]
   */


  function parseList(lexer, isConst) {
    var start = lexer.token;
    var item = isConst ? parseConstValue : parseValueValue;
    return {
      kind: Kind.LIST,
      values: any(lexer, TokenKind.BRACKET_L, item, TokenKind.BRACKET_R),
      loc: loc(lexer, start)
    };
  }
  /**
   * ObjectValue[Const] :
   *   - { }
   *   - { ObjectField[?Const]+ }
   */


  function parseObject(lexer, isConst) {
    var start = lexer.token;

    var item = function item() {
      return parseObjectField(lexer, isConst);
    };

    return {
      kind: Kind.OBJECT,
      fields: any(lexer, TokenKind.BRACE_L, item, TokenKind.BRACE_R),
      loc: loc(lexer, start)
    };
  }
  /**
   * ObjectField[Const] : Name : Value[?Const]
   */


  function parseObjectField(lexer, isConst) {
    var start = lexer.token;
    var name = parseName(lexer);
    expectToken(lexer, TokenKind.COLON);
    return {
      kind: Kind.OBJECT_FIELD,
      name: name,
      value: parseValueLiteral(lexer, isConst),
      loc: loc(lexer, start)
    };
  } // Implements the parsing rules in the Directives section.

  /**
   * Directives[Const] : Directive[?Const]+
   */


  function parseDirectives(lexer, isConst) {
    var directives = [];

    while (peek(lexer, TokenKind.AT)) {
      directives.push(parseDirective(lexer, isConst));
    }

    return directives;
  }
  /**
   * Directive[Const] : @ Name Arguments[?Const]?
   */


  function parseDirective(lexer, isConst) {
    var start = lexer.token;
    expectToken(lexer, TokenKind.AT);
    return {
      kind: Kind.DIRECTIVE,
      name: parseName(lexer),
      arguments: parseArguments(lexer, isConst),
      loc: loc(lexer, start)
    };
  } // Implements the parsing rules in the Types section.

  /**
   * Type :
   *   - NamedType
   *   - ListType
   *   - NonNullType
   */


  function parseTypeReference(lexer) {
    var start = lexer.token;
    var type;

    if (expectOptionalToken(lexer, TokenKind.BRACKET_L)) {
      type = parseTypeReference(lexer);
      expectToken(lexer, TokenKind.BRACKET_R);
      type = {
        kind: Kind.LIST_TYPE,
        type: type,
        loc: loc(lexer, start)
      };
    } else {
      type = parseNamedType(lexer);
    }

    if (expectOptionalToken(lexer, TokenKind.BANG)) {
      return {
        kind: Kind.NON_NULL_TYPE,
        type: type,
        loc: loc(lexer, start)
      };
    }

    return type;
  }
  /**
   * NamedType : Name
   */

  function parseNamedType(lexer) {
    var start = lexer.token;
    return {
      kind: Kind.NAMED_TYPE,
      name: parseName(lexer),
      loc: loc(lexer, start)
    };
  } // Implements the parsing rules in the Type Definition section.

  /**
   * TypeSystemDefinition :
   *   - SchemaDefinition
   *   - TypeDefinition
   *   - DirectiveDefinition
   *
   * TypeDefinition :
   *   - ScalarTypeDefinition
   *   - ObjectTypeDefinition
   *   - InterfaceTypeDefinition
   *   - UnionTypeDefinition
   *   - EnumTypeDefinition
   *   - InputObjectTypeDefinition
   */

  function parseTypeSystemDefinition(lexer) {
    // Many definitions begin with a description and require a lookahead.
    var keywordToken = peekDescription(lexer) ? lexer.lookahead() : lexer.token;

    if (keywordToken.kind === TokenKind.NAME) {
      switch (keywordToken.value) {
        case 'schema':
          return parseSchemaDefinition(lexer);

        case 'scalar':
          return parseScalarTypeDefinition(lexer);

        case 'type':
          return parseObjectTypeDefinition(lexer);

        case 'interface':
          return parseInterfaceTypeDefinition(lexer);

        case 'union':
          return parseUnionTypeDefinition(lexer);

        case 'enum':
          return parseEnumTypeDefinition(lexer);

        case 'input':
          return parseInputObjectTypeDefinition(lexer);

        case 'directive':
          return parseDirectiveDefinition(lexer);
      }
    }

    throw unexpected(lexer, keywordToken);
  }

  function peekDescription(lexer) {
    return peek(lexer, TokenKind.STRING) || peek(lexer, TokenKind.BLOCK_STRING);
  }
  /**
   * Description : StringValue
   */


  function parseDescription(lexer) {
    if (peekDescription(lexer)) {
      return parseStringLiteral(lexer);
    }
  }
  /**
   * SchemaDefinition : schema Directives[Const]? { OperationTypeDefinition+ }
   */


  function parseSchemaDefinition(lexer) {
    var start = lexer.token;
    expectKeyword(lexer, 'schema');
    var directives = parseDirectives(lexer, true);
    var operationTypes = many(lexer, TokenKind.BRACE_L, parseOperationTypeDefinition, TokenKind.BRACE_R);
    return {
      kind: Kind.SCHEMA_DEFINITION,
      directives: directives,
      operationTypes: operationTypes,
      loc: loc(lexer, start)
    };
  }
  /**
   * OperationTypeDefinition : OperationType : NamedType
   */


  function parseOperationTypeDefinition(lexer) {
    var start = lexer.token;
    var operation = parseOperationType(lexer);
    expectToken(lexer, TokenKind.COLON);
    var type = parseNamedType(lexer);
    return {
      kind: Kind.OPERATION_TYPE_DEFINITION,
      operation: operation,
      type: type,
      loc: loc(lexer, start)
    };
  }
  /**
   * ScalarTypeDefinition : Description? scalar Name Directives[Const]?
   */


  function parseScalarTypeDefinition(lexer) {
    var start = lexer.token;
    var description = parseDescription(lexer);
    expectKeyword(lexer, 'scalar');
    var name = parseName(lexer);
    var directives = parseDirectives(lexer, true);
    return {
      kind: Kind.SCALAR_TYPE_DEFINITION,
      description: description,
      name: name,
      directives: directives,
      loc: loc(lexer, start)
    };
  }
  /**
   * ObjectTypeDefinition :
   *   Description?
   *   type Name ImplementsInterfaces? Directives[Const]? FieldsDefinition?
   */


  function parseObjectTypeDefinition(lexer) {
    var start = lexer.token;
    var description = parseDescription(lexer);
    expectKeyword(lexer, 'type');
    var name = parseName(lexer);
    var interfaces = parseImplementsInterfaces(lexer);
    var directives = parseDirectives(lexer, true);
    var fields = parseFieldsDefinition(lexer);
    return {
      kind: Kind.OBJECT_TYPE_DEFINITION,
      description: description,
      name: name,
      interfaces: interfaces,
      directives: directives,
      fields: fields,
      loc: loc(lexer, start)
    };
  }
  /**
   * ImplementsInterfaces :
   *   - implements `&`? NamedType
   *   - ImplementsInterfaces & NamedType
   */


  function parseImplementsInterfaces(lexer) {
    var types = [];

    if (expectOptionalKeyword(lexer, 'implements')) {
      // Optional leading ampersand
      expectOptionalToken(lexer, TokenKind.AMP);

      do {
        types.push(parseNamedType(lexer));
      } while (expectOptionalToken(lexer, TokenKind.AMP) || // Legacy support for the SDL?
      lexer.options.allowLegacySDLImplementsInterfaces && peek(lexer, TokenKind.NAME));
    }

    return types;
  }
  /**
   * FieldsDefinition : { FieldDefinition+ }
   */


  function parseFieldsDefinition(lexer) {
    // Legacy support for the SDL?
    if (lexer.options.allowLegacySDLEmptyFields && peek(lexer, TokenKind.BRACE_L) && lexer.lookahead().kind === TokenKind.BRACE_R) {
      lexer.advance();
      lexer.advance();
      return [];
    }

    return peek(lexer, TokenKind.BRACE_L) ? many(lexer, TokenKind.BRACE_L, parseFieldDefinition, TokenKind.BRACE_R) : [];
  }
  /**
   * FieldDefinition :
   *   - Description? Name ArgumentsDefinition? : Type Directives[Const]?
   */


  function parseFieldDefinition(lexer) {
    var start = lexer.token;
    var description = parseDescription(lexer);
    var name = parseName(lexer);
    var args = parseArgumentDefs(lexer);
    expectToken(lexer, TokenKind.COLON);
    var type = parseTypeReference(lexer);
    var directives = parseDirectives(lexer, true);
    return {
      kind: Kind.FIELD_DEFINITION,
      description: description,
      name: name,
      arguments: args,
      type: type,
      directives: directives,
      loc: loc(lexer, start)
    };
  }
  /**
   * ArgumentsDefinition : ( InputValueDefinition+ )
   */


  function parseArgumentDefs(lexer) {
    if (!peek(lexer, TokenKind.PAREN_L)) {
      return [];
    }

    return many(lexer, TokenKind.PAREN_L, parseInputValueDef, TokenKind.PAREN_R);
  }
  /**
   * InputValueDefinition :
   *   - Description? Name : Type DefaultValue? Directives[Const]?
   */


  function parseInputValueDef(lexer) {
    var start = lexer.token;
    var description = parseDescription(lexer);
    var name = parseName(lexer);
    expectToken(lexer, TokenKind.COLON);
    var type = parseTypeReference(lexer);
    var defaultValue;

    if (expectOptionalToken(lexer, TokenKind.EQUALS)) {
      defaultValue = parseConstValue(lexer);
    }

    var directives = parseDirectives(lexer, true);
    return {
      kind: Kind.INPUT_VALUE_DEFINITION,
      description: description,
      name: name,
      type: type,
      defaultValue: defaultValue,
      directives: directives,
      loc: loc(lexer, start)
    };
  }
  /**
   * InterfaceTypeDefinition :
   *   - Description? interface Name Directives[Const]? FieldsDefinition?
   */


  function parseInterfaceTypeDefinition(lexer) {
    var start = lexer.token;
    var description = parseDescription(lexer);
    expectKeyword(lexer, 'interface');
    var name = parseName(lexer);
    var directives = parseDirectives(lexer, true);
    var fields = parseFieldsDefinition(lexer);
    return {
      kind: Kind.INTERFACE_TYPE_DEFINITION,
      description: description,
      name: name,
      directives: directives,
      fields: fields,
      loc: loc(lexer, start)
    };
  }
  /**
   * UnionTypeDefinition :
   *   - Description? union Name Directives[Const]? UnionMemberTypes?
   */


  function parseUnionTypeDefinition(lexer) {
    var start = lexer.token;
    var description = parseDescription(lexer);
    expectKeyword(lexer, 'union');
    var name = parseName(lexer);
    var directives = parseDirectives(lexer, true);
    var types = parseUnionMemberTypes(lexer);
    return {
      kind: Kind.UNION_TYPE_DEFINITION,
      description: description,
      name: name,
      directives: directives,
      types: types,
      loc: loc(lexer, start)
    };
  }
  /**
   * UnionMemberTypes :
   *   - = `|`? NamedType
   *   - UnionMemberTypes | NamedType
   */


  function parseUnionMemberTypes(lexer) {
    var types = [];

    if (expectOptionalToken(lexer, TokenKind.EQUALS)) {
      // Optional leading pipe
      expectOptionalToken(lexer, TokenKind.PIPE);

      do {
        types.push(parseNamedType(lexer));
      } while (expectOptionalToken(lexer, TokenKind.PIPE));
    }

    return types;
  }
  /**
   * EnumTypeDefinition :
   *   - Description? enum Name Directives[Const]? EnumValuesDefinition?
   */


  function parseEnumTypeDefinition(lexer) {
    var start = lexer.token;
    var description = parseDescription(lexer);
    expectKeyword(lexer, 'enum');
    var name = parseName(lexer);
    var directives = parseDirectives(lexer, true);
    var values = parseEnumValuesDefinition(lexer);
    return {
      kind: Kind.ENUM_TYPE_DEFINITION,
      description: description,
      name: name,
      directives: directives,
      values: values,
      loc: loc(lexer, start)
    };
  }
  /**
   * EnumValuesDefinition : { EnumValueDefinition+ }
   */


  function parseEnumValuesDefinition(lexer) {
    return peek(lexer, TokenKind.BRACE_L) ? many(lexer, TokenKind.BRACE_L, parseEnumValueDefinition, TokenKind.BRACE_R) : [];
  }
  /**
   * EnumValueDefinition : Description? EnumValue Directives[Const]?
   *
   * EnumValue : Name
   */


  function parseEnumValueDefinition(lexer) {
    var start = lexer.token;
    var description = parseDescription(lexer);
    var name = parseName(lexer);
    var directives = parseDirectives(lexer, true);
    return {
      kind: Kind.ENUM_VALUE_DEFINITION,
      description: description,
      name: name,
      directives: directives,
      loc: loc(lexer, start)
    };
  }
  /**
   * InputObjectTypeDefinition :
   *   - Description? input Name Directives[Const]? InputFieldsDefinition?
   */


  function parseInputObjectTypeDefinition(lexer) {
    var start = lexer.token;
    var description = parseDescription(lexer);
    expectKeyword(lexer, 'input');
    var name = parseName(lexer);
    var directives = parseDirectives(lexer, true);
    var fields = parseInputFieldsDefinition(lexer);
    return {
      kind: Kind.INPUT_OBJECT_TYPE_DEFINITION,
      description: description,
      name: name,
      directives: directives,
      fields: fields,
      loc: loc(lexer, start)
    };
  }
  /**
   * InputFieldsDefinition : { InputValueDefinition+ }
   */


  function parseInputFieldsDefinition(lexer) {
    return peek(lexer, TokenKind.BRACE_L) ? many(lexer, TokenKind.BRACE_L, parseInputValueDef, TokenKind.BRACE_R) : [];
  }
  /**
   * TypeSystemExtension :
   *   - SchemaExtension
   *   - TypeExtension
   *
   * TypeExtension :
   *   - ScalarTypeExtension
   *   - ObjectTypeExtension
   *   - InterfaceTypeExtension
   *   - UnionTypeExtension
   *   - EnumTypeExtension
   *   - InputObjectTypeDefinition
   */


  function parseTypeSystemExtension(lexer) {
    var keywordToken = lexer.lookahead();

    if (keywordToken.kind === TokenKind.NAME) {
      switch (keywordToken.value) {
        case 'schema':
          return parseSchemaExtension(lexer);

        case 'scalar':
          return parseScalarTypeExtension(lexer);

        case 'type':
          return parseObjectTypeExtension(lexer);

        case 'interface':
          return parseInterfaceTypeExtension(lexer);

        case 'union':
          return parseUnionTypeExtension(lexer);

        case 'enum':
          return parseEnumTypeExtension(lexer);

        case 'input':
          return parseInputObjectTypeExtension(lexer);
      }
    }

    throw unexpected(lexer, keywordToken);
  }
  /**
   * SchemaExtension :
   *  - extend schema Directives[Const]? { OperationTypeDefinition+ }
   *  - extend schema Directives[Const]
   */


  function parseSchemaExtension(lexer) {
    var start = lexer.token;
    expectKeyword(lexer, 'extend');
    expectKeyword(lexer, 'schema');
    var directives = parseDirectives(lexer, true);
    var operationTypes = peek(lexer, TokenKind.BRACE_L) ? many(lexer, TokenKind.BRACE_L, parseOperationTypeDefinition, TokenKind.BRACE_R) : [];

    if (directives.length === 0 && operationTypes.length === 0) {
      throw unexpected(lexer);
    }

    return {
      kind: Kind.SCHEMA_EXTENSION,
      directives: directives,
      operationTypes: operationTypes,
      loc: loc(lexer, start)
    };
  }
  /**
   * ScalarTypeExtension :
   *   - extend scalar Name Directives[Const]
   */


  function parseScalarTypeExtension(lexer) {
    var start = lexer.token;
    expectKeyword(lexer, 'extend');
    expectKeyword(lexer, 'scalar');
    var name = parseName(lexer);
    var directives = parseDirectives(lexer, true);

    if (directives.length === 0) {
      throw unexpected(lexer);
    }

    return {
      kind: Kind.SCALAR_TYPE_EXTENSION,
      name: name,
      directives: directives,
      loc: loc(lexer, start)
    };
  }
  /**
   * ObjectTypeExtension :
   *  - extend type Name ImplementsInterfaces? Directives[Const]? FieldsDefinition
   *  - extend type Name ImplementsInterfaces? Directives[Const]
   *  - extend type Name ImplementsInterfaces
   */


  function parseObjectTypeExtension(lexer) {
    var start = lexer.token;
    expectKeyword(lexer, 'extend');
    expectKeyword(lexer, 'type');
    var name = parseName(lexer);
    var interfaces = parseImplementsInterfaces(lexer);
    var directives = parseDirectives(lexer, true);
    var fields = parseFieldsDefinition(lexer);

    if (interfaces.length === 0 && directives.length === 0 && fields.length === 0) {
      throw unexpected(lexer);
    }

    return {
      kind: Kind.OBJECT_TYPE_EXTENSION,
      name: name,
      interfaces: interfaces,
      directives: directives,
      fields: fields,
      loc: loc(lexer, start)
    };
  }
  /**
   * InterfaceTypeExtension :
   *   - extend interface Name Directives[Const]? FieldsDefinition
   *   - extend interface Name Directives[Const]
   */


  function parseInterfaceTypeExtension(lexer) {
    var start = lexer.token;
    expectKeyword(lexer, 'extend');
    expectKeyword(lexer, 'interface');
    var name = parseName(lexer);
    var directives = parseDirectives(lexer, true);
    var fields = parseFieldsDefinition(lexer);

    if (directives.length === 0 && fields.length === 0) {
      throw unexpected(lexer);
    }

    return {
      kind: Kind.INTERFACE_TYPE_EXTENSION,
      name: name,
      directives: directives,
      fields: fields,
      loc: loc(lexer, start)
    };
  }
  /**
   * UnionTypeExtension :
   *   - extend union Name Directives[Const]? UnionMemberTypes
   *   - extend union Name Directives[Const]
   */


  function parseUnionTypeExtension(lexer) {
    var start = lexer.token;
    expectKeyword(lexer, 'extend');
    expectKeyword(lexer, 'union');
    var name = parseName(lexer);
    var directives = parseDirectives(lexer, true);
    var types = parseUnionMemberTypes(lexer);

    if (directives.length === 0 && types.length === 0) {
      throw unexpected(lexer);
    }

    return {
      kind: Kind.UNION_TYPE_EXTENSION,
      name: name,
      directives: directives,
      types: types,
      loc: loc(lexer, start)
    };
  }
  /**
   * EnumTypeExtension :
   *   - extend enum Name Directives[Const]? EnumValuesDefinition
   *   - extend enum Name Directives[Const]
   */


  function parseEnumTypeExtension(lexer) {
    var start = lexer.token;
    expectKeyword(lexer, 'extend');
    expectKeyword(lexer, 'enum');
    var name = parseName(lexer);
    var directives = parseDirectives(lexer, true);
    var values = parseEnumValuesDefinition(lexer);

    if (directives.length === 0 && values.length === 0) {
      throw unexpected(lexer);
    }

    return {
      kind: Kind.ENUM_TYPE_EXTENSION,
      name: name,
      directives: directives,
      values: values,
      loc: loc(lexer, start)
    };
  }
  /**
   * InputObjectTypeExtension :
   *   - extend input Name Directives[Const]? InputFieldsDefinition
   *   - extend input Name Directives[Const]
   */


  function parseInputObjectTypeExtension(lexer) {
    var start = lexer.token;
    expectKeyword(lexer, 'extend');
    expectKeyword(lexer, 'input');
    var name = parseName(lexer);
    var directives = parseDirectives(lexer, true);
    var fields = parseInputFieldsDefinition(lexer);

    if (directives.length === 0 && fields.length === 0) {
      throw unexpected(lexer);
    }

    return {
      kind: Kind.INPUT_OBJECT_TYPE_EXTENSION,
      name: name,
      directives: directives,
      fields: fields,
      loc: loc(lexer, start)
    };
  }
  /**
   * DirectiveDefinition :
   *   - Description? directive @ Name ArgumentsDefinition? on DirectiveLocations
   */


  function parseDirectiveDefinition(lexer) {
    var start = lexer.token;
    var description = parseDescription(lexer);
    expectKeyword(lexer, 'directive');
    expectToken(lexer, TokenKind.AT);
    var name = parseName(lexer);
    var args = parseArgumentDefs(lexer);
    expectKeyword(lexer, 'on');
    var locations = parseDirectiveLocations(lexer);
    return {
      kind: Kind.DIRECTIVE_DEFINITION,
      description: description,
      name: name,
      arguments: args,
      locations: locations,
      loc: loc(lexer, start)
    };
  }
  /**
   * DirectiveLocations :
   *   - `|`? DirectiveLocation
   *   - DirectiveLocations | DirectiveLocation
   */


  function parseDirectiveLocations(lexer) {
    // Optional leading pipe
    expectOptionalToken(lexer, TokenKind.PIPE);
    var locations = [];

    do {
      locations.push(parseDirectiveLocation(lexer));
    } while (expectOptionalToken(lexer, TokenKind.PIPE));

    return locations;
  }
  /*
   * DirectiveLocation :
   *   - ExecutableDirectiveLocation
   *   - TypeSystemDirectiveLocation
   *
   * ExecutableDirectiveLocation : one of
   *   `QUERY`
   *   `MUTATION`
   *   `SUBSCRIPTION`
   *   `FIELD`
   *   `FRAGMENT_DEFINITION`
   *   `FRAGMENT_SPREAD`
   *   `INLINE_FRAGMENT`
   *
   * TypeSystemDirectiveLocation : one of
   *   `SCHEMA`
   *   `SCALAR`
   *   `OBJECT`
   *   `FIELD_DEFINITION`
   *   `ARGUMENT_DEFINITION`
   *   `INTERFACE`
   *   `UNION`
   *   `ENUM`
   *   `ENUM_VALUE`
   *   `INPUT_OBJECT`
   *   `INPUT_FIELD_DEFINITION`
   */


  function parseDirectiveLocation(lexer) {
    var start = lexer.token;
    var name = parseName(lexer);

    if (DirectiveLocation.hasOwnProperty(name.value)) {
      return name;
    }

    throw unexpected(lexer, start);
  } // Core parsing utility functions

  /**
   * Returns a location object, used to identify the place in
   * the source that created a given parsed object.
   */


  function loc(lexer, startToken) {
    if (!lexer.options.noLocation) {
      return new Loc(startToken, lexer.lastToken, lexer.source);
    }
  }

  function Loc(startToken, endToken, source) {
    this.start = startToken.start;
    this.end = endToken.end;
    this.startToken = startToken;
    this.endToken = endToken;
    this.source = source;
  } // Print a simplified form when appearing in JSON/util.inspect.


  defineToJSON(Loc, function () {
    return {
      start: this.start,
      end: this.end
    };
  });
  /**
   * Determines if the next token is of a given kind
   */

  function peek(lexer, kind) {
    return lexer.token.kind === kind;
  }
  /**
   * If the next token is of the given kind, return that token after advancing
   * the lexer. Otherwise, do not change the parser state and throw an error.
   */


  function expectToken(lexer, kind) {
    var token = lexer.token;

    if (token.kind === kind) {
      lexer.advance();
      return token;
    }

    throw syntaxError(lexer.source, token.start, "Expected ".concat(kind, ", found ").concat(getTokenDesc(token)));
  }
  /**
   * If the next token is of the given kind, return that token after advancing
   * the lexer. Otherwise, do not change the parser state and return undefined.
   */


  function expectOptionalToken(lexer, kind) {
    var token = lexer.token;

    if (token.kind === kind) {
      lexer.advance();
      return token;
    }

    return undefined;
  }
  /**
   * If the next token is a given keyword, return that token after advancing
   * the lexer. Otherwise, do not change the parser state and throw an error.
   */


  function expectKeyword(lexer, value) {
    var token = lexer.token;

    if (token.kind === TokenKind.NAME && token.value === value) {
      lexer.advance();
      return token;
    }

    throw syntaxError(lexer.source, token.start, "Expected \"".concat(value, "\", found ").concat(getTokenDesc(token)));
  }
  /**
   * If the next token is a given keyword, return that token after advancing
   * the lexer. Otherwise, do not change the parser state and return undefined.
   */


  function expectOptionalKeyword(lexer, value) {
    var token = lexer.token;

    if (token.kind === TokenKind.NAME && token.value === value) {
      lexer.advance();
      return token;
    }

    return undefined;
  }
  /**
   * Helper function for creating an error when an unexpected lexed token
   * is encountered.
   */


  function unexpected(lexer, atToken) {
    var token = atToken || lexer.token;
    return syntaxError(lexer.source, token.start, "Unexpected ".concat(getTokenDesc(token)));
  }
  /**
   * Returns a possibly empty list of parse nodes, determined by
   * the parseFn. This list begins with a lex token of openKind
   * and ends with a lex token of closeKind. Advances the parser
   * to the next lex token after the closing token.
   */


  function any(lexer, openKind, parseFn, closeKind) {
    expectToken(lexer, openKind);
    var nodes = [];

    while (!expectOptionalToken(lexer, closeKind)) {
      nodes.push(parseFn(lexer));
    }

    return nodes;
  }
  /**
   * Returns a non-empty list of parse nodes, determined by
   * the parseFn. This list begins with a lex token of openKind
   * and ends with a lex token of closeKind. Advances the parser
   * to the next lex token after the closing token.
   */


  function many(lexer, openKind, parseFn, closeKind) {
    expectToken(lexer, openKind);
    var nodes = [parseFn(lexer)];

    while (!expectOptionalToken(lexer, closeKind)) {
      nodes.push(parseFn(lexer));
    }

    return nodes;
  }

  var parser = /*#__PURE__*/Object.freeze({
    parse: parse,
    parseValue: parseValue,
    parseType: parseType,
    parseConstValue: parseConstValue,
    parseTypeReference: parseTypeReference,
    parseNamedType: parseNamedType
  });

  var parser$1 = getCjsExportFromNamespace(parser);

  var parse$1 = parser$1.parse;

  // Strip insignificant whitespace
  // Note that this could do a lot more, such as reorder fields etc.
  function normalize(string) {
    return string.replace(/[\s,]+/g, ' ').trim();
  }

  // A map docString -> graphql document
  var docCache = {};

  // A map fragmentName -> [normalized source]
  var fragmentSourceMap = {};

  function cacheKeyFromLoc(loc) {
    return normalize(loc.source.body.substring(loc.start, loc.end));
  }

  // For testing.
  function resetCaches() {
    docCache = {};
    fragmentSourceMap = {};
  }

  // Take a unstripped parsed document (query/mutation or even fragment), and
  // check all fragment definitions, checking for name->source uniqueness.
  // We also want to make sure only unique fragments exist in the document.
  var printFragmentWarnings = true;
  function processFragments(ast) {
    var astFragmentMap = {};
    var definitions = [];

    for (var i = 0; i < ast.definitions.length; i++) {
      var fragmentDefinition = ast.definitions[i];

      if (fragmentDefinition.kind === 'FragmentDefinition') {
        var fragmentName = fragmentDefinition.name.value;
        var sourceKey = cacheKeyFromLoc(fragmentDefinition.loc);

        // We know something about this fragment
        if (fragmentSourceMap.hasOwnProperty(fragmentName) && !fragmentSourceMap[fragmentName][sourceKey]) {

          // this is a problem because the app developer is trying to register another fragment with
          // the same name as one previously registered. So, we tell them about it.
          if (printFragmentWarnings) {
            console.warn("Warning: fragment with name " + fragmentName + " already exists.\n"
              + "graphql-tag enforces all fragment names across your application to be unique; read more about\n"
              + "this in the docs: http://dev.apollodata.com/core/fragments.html#unique-names");
          }

          fragmentSourceMap[fragmentName][sourceKey] = true;

        } else if (!fragmentSourceMap.hasOwnProperty(fragmentName)) {
          fragmentSourceMap[fragmentName] = {};
          fragmentSourceMap[fragmentName][sourceKey] = true;
        }

        if (!astFragmentMap[sourceKey]) {
          astFragmentMap[sourceKey] = true;
          definitions.push(fragmentDefinition);
        }
      } else {
        definitions.push(fragmentDefinition);
      }
    }

    ast.definitions = definitions;
    return ast;
  }

  function disableFragmentWarnings() {
    printFragmentWarnings = false;
  }

  function stripLoc(doc, removeLocAtThisLevel) {
    var docType = Object.prototype.toString.call(doc);

    if (docType === '[object Array]') {
      return doc.map(function (d) {
        return stripLoc(d, removeLocAtThisLevel);
      });
    }

    if (docType !== '[object Object]') {
      throw new Error('Unexpected input.');
    }

    // We don't want to remove the root loc field so we can use it
    // for fragment substitution (see below)
    if (removeLocAtThisLevel && doc.loc) {
      delete doc.loc;
    }

    // https://github.com/apollographql/graphql-tag/issues/40
    if (doc.loc) {
      delete doc.loc.startToken;
      delete doc.loc.endToken;
    }

    var keys = Object.keys(doc);
    var key;
    var value;
    var valueType;

    for (key in keys) {
      if (keys.hasOwnProperty(key)) {
        value = doc[keys[key]];
        valueType = Object.prototype.toString.call(value);

        if (valueType === '[object Object]' || valueType === '[object Array]') {
          doc[keys[key]] = stripLoc(value, true);
        }
      }
    }

    return doc;
  }

  var experimentalFragmentVariables = false;
  function parseDocument$1(doc) {
    var cacheKey = normalize(doc);

    if (docCache[cacheKey]) {
      return docCache[cacheKey];
    }

    var parsed = parse$1(doc, { experimentalFragmentVariables: experimentalFragmentVariables });
    if (!parsed || parsed.kind !== 'Document') {
      throw new Error('Not a valid GraphQL document.');
    }

    // check that all "new" fragments inside the documents are consistent with
    // existing fragments of the same name
    parsed = processFragments(parsed);
    parsed = stripLoc(parsed, false);
    docCache[cacheKey] = parsed;

    return parsed;
  }

  function enableExperimentalFragmentVariables() {
    experimentalFragmentVariables = true;
  }

  function disableExperimentalFragmentVariables() {
    experimentalFragmentVariables = false;
  }

  // XXX This should eventually disallow arbitrary string interpolation, like Relay does
  function gql(/* arguments */) {
    var args = Array.prototype.slice.call(arguments);

    var literals = args[0];

    // We always get literals[0] and then matching post literals for each arg given
    var result = (typeof(literals) === "string") ? literals : literals[0];

    for (var i = 1; i < args.length; i++) {
      if (args[i] && args[i].kind && args[i].kind === 'Document') {
        result += args[i].loc.source.body;
      } else {
        result += args[i];
      }

      result += literals[i];
    }

    return parseDocument$1(result);
  }

  // Support typescript, which isn't as nice as Babel about default exports
  gql.default = gql;
  gql.resetCaches = resetCaches;
  gql.disableFragmentWarnings = disableFragmentWarnings;
  gql.enableExperimentalFragmentVariables = enableExperimentalFragmentVariables;
  gql.disableExperimentalFragmentVariables = disableExperimentalFragmentVariables;

  var src = gql;

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
        type: [Function, Object],
        required: true
      },
      variables: {
        type: Object,
        "default": undefined
      },
      fetchPolicy: {
        type: String,
        "default": undefined
      },
      pollInterval: {
        type: Number,
        "default": undefined
      },
      notifyOnNetworkStatusChange: {
        type: Boolean,
        "default": undefined
      },
      context: {
        type: Object,
        "default": undefined
      },
      update: {
        type: Function,
        "default": function _default(data) {
          return data;
        }
      },
      skip: {
        type: Boolean,
        "default": false
      },
      debounce: {
        type: Number,
        "default": 0
      },
      throttle: {
        type: Number,
        "default": 0
      },
      clientId: {
        type: String,
        "default": undefined
      },
      deep: {
        type: Boolean,
        "default": undefined
      },
      tag: {
        type: String,
        "default": 'div'
      },
      prefetch: {
        type: Boolean,
        "default": true
      }
    },
    data: function data() {
      return {
        result: {
          data: null,
          loading: false,
          networkStatus: 7,
          error: null
        },
        times: 0
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
      },
      '$data.$apolloData.loading': function $data$apolloDataLoading(value) {
        this.$emit('loading', !!value);
      }
    },
    apollo: {
      $client: function $client() {
        return this.clientId;
      },
      query: function query() {
        return {
          query: function query() {
            if (typeof this.query === 'function') {
              return this.query(src);
            }

            return this.query;
          },
          variables: function variables() {
            return this.variables;
          },
          fetchPolicy: this.fetchPolicy,
          pollInterval: this.pollInterval,
          debounce: this.debounce,
          throttle: this.throttle,
          notifyOnNetworkStatusChange: this.notifyOnNetworkStatusChange,
          context: function context() {
            return this.context;
          },
          skip: function skip() {
            return this.skip;
          },
          deep: this.deep,
          prefetch: this.prefetch,
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
              error = new Error("Apollo errors occured (".concat(errors.length, ")"));
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

            var dataNotEmpty = isDataFilled(data);
            this.result = {
              data: dataNotEmpty ? this.update(data) : undefined,
              fullData: dataNotEmpty ? data : undefined,
              loading: loading,
              error: error,
              networkStatus: networkStatus
            };
            this.times = ++this.$_times;
            this.$emit('result', this.result);
          },
          error: function error(_error) {
            this.result.loading = false;
            this.result.error = _error;
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
      var result = this.$scopedSlots["default"]({
        result: this.result,
        times: this.times,
        query: this.$apollo.queries.query,
        isLoading: this.$apolloData.loading,
        gqlError: this.result && this.result.error && this.result.error.gqlError
      });

      if (Array.isArray(result)) {
        result = result.concat(this.$slots["default"]);
      } else {
        result = [result].concat(this.$slots["default"]);
      }

      return this.tag ? h(this.tag, result) : result[0];
    }
  };

  var uid = 0;
  var CApolloSubscribeToMore = {
    name: 'ApolloSubscribeToMore',
    inject: ['getDollarApollo', 'getApolloQuery'],
    props: {
      document: {
        type: [Function, Object],
        required: true
      },
      variables: {
        type: Object,
        "default": undefined
      },
      updateQuery: {
        type: Function,
        "default": undefined
      }
    },
    watch: {
      document: 'refresh',
      variables: 'refresh'
    },
    created: function created() {
      this.$_key = "sub_component_".concat(uid++);
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
        var document = this.document;

        if (typeof document === 'function') {
          document = document(src);
        }

        this.$_sub = this.getDollarApollo().addSmartSubscription(this.$_key, {
          document: document,
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
        type: [Function, Object],
        required: true
      },
      variables: {
        type: Object,
        "default": undefined
      },
      optimisticResponse: {
        type: Object,
        "default": undefined
      },
      update: {
        type: Function,
        "default": undefined
      },
      refetchQueries: {
        type: Function,
        "default": undefined
      },
      clientId: {
        type: String,
        "default": undefined
      },
      tag: {
        type: String,
        "default": 'div'
      }
    },
    data: function data() {
      return {
        loading: false,
        error: null
      };
    },
    watch: {
      loading: function loading(value) {
        this.$emit('loading', value);
      }
    },
    methods: {
      mutate: function mutate(options) {
        var _this = this;

        this.loading = true;
        this.error = null;
        var mutation = this.mutation;

        if (typeof mutation === 'function') {
          mutation = mutation(src);
        }

        this.$apollo.mutate(_objectSpread({
          mutation: mutation,
          client: this.clientId,
          variables: this.variables,
          optimisticResponse: this.optimisticResponse,
          update: this.update,
          refetchQueries: this.refetchQueries
        }, options)).then(function (result) {
          _this.$emit('done', result);

          _this.loading = false;
        })["catch"](function (e) {
          utils_7(e);
          _this.error = e;

          _this.$emit('error', e);

          _this.loading = false;
        });
      }
    },
    render: function render(h) {
      var result = this.$scopedSlots["default"]({
        mutate: this.mutate,
        loading: this.loading,
        error: this.error,
        gqlError: this.error && this.error.gqlError
      });

      if (Array.isArray(result)) {
        result = result.concat(this.$slots["default"]);
      } else {
        result = [result].concat(this.$slots["default"]);
      }

      return this.tag ? h(this.tag, result) : result[0];
    }
  };

  function hasProperty(holder, key) {
    return typeof holder !== 'undefined' && Object.prototype.hasOwnProperty.call(holder, key);
  }

  function initProvider() {
    var options = this.$options; // ApolloProvider injection

    var optionValue = options.apolloProvider;

    if (optionValue) {
      this.$apolloProvider = typeof optionValue === 'function' ? optionValue() : optionValue;
    } else if (options.parent && options.parent.$apolloProvider) {
      this.$apolloProvider = options.parent.$apolloProvider;
    } else if (options.provide) {
      // TODO remove
      // Temporary retro-compatibility
      var provided = typeof options.provide === 'function' ? options.provide.call(this) : options.provide;

      if (provided && provided.$apolloProvider) {
        this.$apolloProvider = provided.$apolloProvider;
      }
    }
  }

  function proxyData() {
    var _this = this;

    this.$_apolloInitData = {};
    var apollo = this.$options.apollo;

    if (apollo) {
      var _loop = function _loop(key) {
        if (key.charAt(0) !== '$') {
          var options = apollo[key]; // Property proxy

          if (!options.manual && !hasProperty(_this.$options.props, key) && !hasProperty(_this.$options.computed, key) && !hasProperty(_this.$options.methods, key)) {
            Object.defineProperty(_this, key, {
              get: function get() {
                return _this.$data.$apolloData.data[key];
              },
              // For component class constructor
              set: function set(value) {
                return _this.$_apolloInitData[key] = value;
              },
              enumerable: true,
              configurable: true
            });
          }
        }
      };

      // watchQuery
      for (var key in apollo) {
        _loop(key);
      }
    }
  }

  function launch() {
    var _this2 = this;

    var apolloProvider = this.$apolloProvider;
    if (this._apolloLaunched || !apolloProvider) return;
    this._apolloLaunched = true; // Prepare properties

    var apollo = this.$options.apollo;

    if (apollo) {
      this.$_apolloPromises = [];

      if (!apollo.$init) {
        apollo.$init = true; // Default options applied to `apollo` options

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
      defineReactiveSetter(this.$apollo, 'watchLoading', apollo.$watchLoading, apollo.$deep); // Apollo Data

      Object.defineProperty(this, '$apolloData', {
        get: function get() {
          return _this2.$data.$apolloData;
        },
        enumerable: true,
        configurable: true
      }); // watchQuery

      for (var key in apollo) {
        if (key.charAt(0) !== '$') {
          var options = apollo[key];
          var smart = this.$apollo.addSmartQuery(key, options);

          if (this.$isServer) {
            options = utils_5(options, this);

            if (options.prefetch !== false && apollo.$prefetch !== false && !smart.skip) {
              this.$_apolloPromises.push(smart.firstRun);
            }
          }
        }
      }

      if (apollo.subscribe) {
        utils_1.Vue.util.warn('vue-apollo -> `subscribe` option is deprecated. Use the `$subscribe` option instead.');
      }

      if (apollo.$subscribe) {
        for (var _key in apollo.$subscribe) {
          this.$apollo.addSmartSubscription(_key, apollo.$subscribe[_key]);
        }
      }
    }
  }

  function defineReactiveSetter($apollo, key, value, deep) {
    if (typeof value !== 'undefined') {
      if (typeof value === 'function') {
        $apollo.defineReactiveSetter(key, value, deep);
      } else {
        $apollo[key] = value;
      }
    }
  }

  function destroy() {
    if (this.$_apollo) {
      this.$_apollo.destroy();
      this.$_apollo = null;
    }
  }

  function installMixin(Vue, vueVersion) {
    Vue.mixin(_objectSpread({}, vueVersion === '1' ? {
      init: initProvider
    } : {}, vueVersion === '2' ? {
      data: function data() {
        return {
          '$apolloData': {
            queries: {},
            loading: 0,
            data: this.$_apolloInitData
          }
        };
      },
      beforeCreate: function beforeCreate() {
        initProvider.call(this);
        proxyData.call(this);
      },
      serverPrefetch: function serverPrefetch() {
        if (this.$_apolloPromises) {
          return Promise.all(this.$_apolloPromises);
        }
      }
    } : {}, {
      created: launch,
      destroyed: destroy
    }));
  }

  var keywords = ['$subscribe'];
  function install(Vue, options) {
    if (install.installed) return;
    install.installed = true;
    utils_1.Vue = Vue;
    var vueVersion = Vue.version.substr(0, Vue.version.indexOf('.')); // Options merging

    var merge = Vue.config.optionMergeStrategies.methods;

    Vue.config.optionMergeStrategies.apollo = function (toVal, fromVal, vm) {
      if (!toVal) return fromVal;
      if (!fromVal) return toVal;
      var toData = Object.assign({}, utils_6(toVal, keywords), toVal.data);
      var fromData = Object.assign({}, utils_6(fromVal, keywords), fromVal.data);
      var map = {};

      for (var i = 0; i < keywords.length; i++) {
        var key = keywords[i];
        map[key] = merge(toVal[key], fromVal[key]);
      }

      return Object.assign(map, merge(toData, fromData));
    }; // Lazy creation


    Object.defineProperty(Vue.prototype, '$apollo', {
      get: function get() {
        if (!this.$_apollo) {
          this.$_apollo = new DollarApollo(this);
        }

        return this.$_apollo;
      }
    });
    installMixin(Vue, vueVersion);

    if (vueVersion === '2') {
      Vue.component('apollo-query', CApolloQuery);
      Vue.component('ApolloQuery', CApolloQuery);
      Vue.component('apollo-subscribe-to-more', CApolloSubscribeToMore);
      Vue.component('ApolloSubscribeToMore', CApolloSubscribeToMore);
      Vue.component('apollo-mutation', CApolloMutation);
      Vue.component('ApolloMutation', CApolloMutation);
    }
  }
  ApolloProvider.install = install; // eslint-disable-next-line no-undef

  ApolloProvider.version = "3.0.0-beta.30"; // Apollo provider

  var ApolloProvider$1 = ApolloProvider; // Components

  var ApolloQuery = CApolloQuery;
  var ApolloSubscribeToMore = CApolloSubscribeToMore;
  var ApolloMutation = CApolloMutation; // Auto-install

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

  Object.defineProperty(exports, '__esModule', { value: true });

})));
