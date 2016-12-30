'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SmartSubscription = exports.SmartQuery = undefined;

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash.omit');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SmartApollo = function () {
  function SmartApollo(vm, key, options) {
    var _this = this;

    _classCallCheck(this, SmartApollo);

    this.type = null;
    this.apolloOptionsKeys = [];

    this.vm = vm;
    this.key = key;
    this.options = options;
    this._skip = false;

    // Query callback
    if (typeof this.options.query === 'function') {
      var queryCb = this.options.query;
      this.vm.$watch(queryCb.bind(this.vm), function (query) {
        _this.options.query = query;
        _this.refresh();
      }, {
        immediate: true
      });
    }

    this.autostart();
  }

  _createClass(SmartApollo, [{
    key: 'autostart',
    value: function autostart() {
      if (typeof this.options.skip === 'function') {
        this.vm.$watch(this.options.skip.bind(this.vm), this.skipChanged.bind(this), {
          immediate: true
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
      this.stop();
      this.start();
    }
  }, {
    key: 'start',
    value: function start() {
      this.starting = true;
      if (typeof this.options.variables === 'function') {
        this.unwatchVariables = this.vm.$watch(this.options.variables.bind(this.vm), this.executeApollo.bind(this), {
          immediate: true
        });
      } else {
        this.executeApollo(this.options.variables);
      }
    }
  }, {
    key: 'stop',
    value: function stop() {
      if (this.unwatchVariables) {
        this.unwatchVariables();
        this.unwatchVariables = null;
      }

      if (this.sub) {
        this.sub.unsubscribe();
        this.sub = null;
      }
    }
  }, {
    key: 'generateApolloOptions',
    value: function generateApolloOptions(variables) {
      var apolloOptions = (0, _lodash2.default)(this.options, this.apolloOptionsKeys);
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
    key: 'catchError',
    value: function catchError(error) {
      if (error.graphQLErrors && error.graphQLErrors.length !== 0) {
        console.error('GraphQL execution errors for ' + this.type + ' ' + this.key);
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = error.graphQLErrors[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var e = _step.value;

            console.error(e);
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
      } else if (error.networkError) {
        console.error('Error sending the ' + this.type + ' ' + this.key, error.networkError);
      } else {
        console.error(error);
      }

      if (typeof this.options.error === 'function') {
        this.options.error(error);
      }
    }
  }, {
    key: 'skip',
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

var SmartQuery = exports.SmartQuery = function (_SmartApollo) {
  _inherits(SmartQuery, _SmartApollo);

  function SmartQuery(vm, key, options) {
    _classCallCheck(this, SmartQuery);

    // Options object callback
    while (typeof options === 'function') {
      options = options.call(vm);
    }

    // Simple query
    if (!options.query) {
      var query = options;
      options = {
        query: query
      };
    }

    var _this2 = _possibleConstructorReturn(this, (SmartQuery.__proto__ || Object.getPrototypeOf(SmartQuery)).call(this, vm, key, options));

    _this2.type = 'query';
    _this2.apolloOptionsKeys = ['variables', 'watch', 'update', 'result', 'error', 'loadingKey', 'watchLoading', 'skip'];
    return _this2;
  }

  _createClass(SmartQuery, [{
    key: 'stop',
    value: function stop() {
      _get(SmartQuery.prototype.__proto__ || Object.getPrototypeOf(SmartQuery.prototype), 'stop', this).call(this);

      if (this.observer) {
        this.observer.stopPolling();
        this.observer = null;
      }
    }
  }, {
    key: 'executeApollo',
    value: function executeApollo(variables) {
      var oldForceFetch = this.options.forceFetch;
      if (this.starting) {
        this.options.forceFetch = true;
      }

      if (this.options.forceFetch && this.observer) {
        // Refresh query
        this.observer.refetch(variables, {
          forceFetch: !!this.options.forceFetch
        });
      } else if (this.observer) {
        // Update variables
        this.observer.setVariables(variables);
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

      var currentResult = this.observer.currentResult();
      if (currentResult.loading) {
        this.applyLoadingModifier(1);
        this.loading = true;
      }

      this.options.forceFetch = oldForceFetch;

      _get(SmartQuery.prototype.__proto__ || Object.getPrototypeOf(SmartQuery.prototype), 'executeApollo', this).call(this, variables);
    }
  }, {
    key: 'nextResult',
    value: function nextResult(_ref) {
      var data = _ref.data;

      this.loadingDone();

      if (typeof this.options.update === 'function') {
        this.vm[this.key] = this.options.update.call(this.vm, data);
      } else if (data[this.key] === undefined) {
        console.error('Missing ' + this.key + ' attribute on result', data);
      } else {
        this.vm[this.key] = data[this.key];
      }

      if (typeof this.options.result === 'function') {
        this.options.result.call(this.vm, data);
      }
    }
  }, {
    key: 'catchError',
    value: function catchError(error) {
      _get(SmartQuery.prototype.__proto__ || Object.getPrototypeOf(SmartQuery.prototype), 'catchError', this).call(this, error);
      this.loadingDone();
    }
  }, {
    key: 'applyLoadingModifier',
    value: function applyLoadingModifier(value) {
      if (this.options.loadingKey) {
        this.vm[this.options.loadingKey] += value;
      }

      if (this.options.loadingChangeCb) {
        this.options.loadingChangeCb.call(this.vm, value === 1, value);
      }
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
    get: function get() {
      return this.observer.fetchMore.bind(this.observer);
    }
  }]);

  return SmartQuery;
}(SmartApollo);

var SmartSubscription = exports.SmartSubscription = function (_SmartApollo2) {
  _inherits(SmartSubscription, _SmartApollo2);

  function SmartSubscription(vm, key, options) {
    _classCallCheck(this, SmartSubscription);

    // Options object callback
    while (typeof options === 'function') {
      options = options.call(vm);
    }

    var _this3 = _possibleConstructorReturn(this, (SmartSubscription.__proto__ || Object.getPrototypeOf(SmartSubscription)).call(this, vm, key, options));

    _this3.type = 'subscription';
    _this3.apolloOptionsKeys = ['variables', 'result', 'error'];
    return _this3;
  }

  _createClass(SmartSubscription, [{
    key: 'executeApollo',
    value: function executeApollo(variables) {
      if (this.sub) {
        this.sub.unsubscribe();
      }

      // Create observer
      this.observer = this.vm.$apollo.subscribe(this.generateApolloOptions(variables));

      // Create subscription
      this.sub = this.observer.subscribe({
        next: this.nextResult.bind(this),
        error: this.catchError.bind(this)
      });

      _get(SmartSubscription.prototype.__proto__ || Object.getPrototypeOf(SmartSubscription.prototype), 'executeApollo', this).call(this, variables);
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