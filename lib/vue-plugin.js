'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash.omit');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var apolloClient = null;

var DollarApollo = function () {
  function DollarApollo(vm) {
    _classCallCheck(this, DollarApollo);

    this.vm = vm;
    this.querySubscriptions = {};
  }

  _createClass(DollarApollo, [{
    key: 'watchQuery',
    value: function watchQuery(options) {
      var vm = this.vm;
      var observable = this.client.watchQuery(options);
      var _subscribe = observable.subscribe.bind(observable);
      observable.subscribe = function (options) {
        var sub = _subscribe(options);
        vm._apolloSubscriptions.push(sub);
        return sub;
      }.bind(observable);
      return observable;
    }
  }, {
    key: 'option',
    value: function option(key, options) {
      var vm = this.vm;
      var $apollo = this;

      var query = void 0,
          observer = void 0,
          sub = void 0;

      var firstLoadingDone = false;

      var loadingKey = options.loadingKey;
      var loadingChangeCb = options.watchLoading;

      if (typeof loadingChangeCb === 'function') {
        loadingChangeCb = loadingChangeCb.bind(vm);
      }

      // Simple query
      if (!options.query) {
        query = options;
      }

      function generateApolloOptions(variables) {
        var apolloOptions = (0, _lodash2.default)(options, ['variables', 'watch', 'update', 'result', 'error', 'loadingKey', 'watchLoading']);
        apolloOptions.variables = variables;
        return apolloOptions;
      }

      function q(variables) {
        applyLoadingModifier(1);

        if (options.forceFetch && observer) {
          // Refresh query
          observer.refetch(variables, {
            forceFetch: !!options.forceFetch
          });
        } else {
          if (sub) {
            sub.unsubscribe();
          }

          // Create observer
          observer = $apollo.watchQuery(generateApolloOptions(variables));

          // Create subscription
          sub = observer.subscribe({
            next: nextResult,
            error: catchError
          });
        }
      }

      if (typeof options.variables === 'function') {
        vm.$watch(options.variables.bind(vm), q, {
          immediate: true
        });
      } else {
        q(options.variables);
      }

      function nextResult(_ref) {
        var data = _ref.data;

        applyData(data);
      }

      function applyData(data) {
        loadingDone();

        if (typeof options.update === 'function') {
          vm[key] = options.update.call(vm, data);
        } else if (data[key] === undefined) {
          console.error('Missing ' + key + ' attribute on result', data);
        } else {
          vm[key] = data[key];
        }

        if (typeof options.result === 'function') {
          options.result.call(vm, data);
        }
      }

      function applyLoadingModifier(value) {
        if (loadingKey) {
          vm[loadingKey] += value;
        }

        if (loadingChangeCb) {
          loadingChangeCb(value === 1, value);
        }
      }

      function loadingDone() {
        if (!firstLoadingDone) {
          applyLoadingModifier(-1);
          firstLoadingDone = true;
        }
      }

      function catchError(error) {
        loadingDone();

        if (error.graphQLErrors && error.graphQLErrors.length !== 0) {
          console.error('GraphQL execution errors for query ' + query);
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
          console.error('Error sending the query ' + query, error.networkError);
        } else {
          console.error(error);
        }

        if (typeof options.error === 'function') {
          options.error(error);
        }
      }
    }
  }, {
    key: 'client',
    get: function get() {
      return apolloClient;
    }
  }, {
    key: 'query',
    get: function get() {
      return this.client.query;
    }
  }, {
    key: 'mutate',
    get: function get() {
      return this.client.mutate;
    }
  }]);

  return DollarApollo;
}();

function prepare() {
  this._apolloSubscriptions = [];

  this.$apollo = new DollarApollo(this);
}

function launch() {
  var apollo = this.$options.apollo;

  if (apollo) {
    var queries = (0, _lodash2.default)(apollo, ['subscribe']);

    // watchQuery
    for (var key in queries) {
      this.$apollo.option(key, queries[key]);
    }

    // subscribe
    if (apollo.subscribe) {
      // TODO
    }
  }
}

module.exports = {
  install: function install(Vue, options) {

    apolloClient = options.apolloClient;

    Vue.mixin({

      // Vue 1.x
      init: prepare,
      // Vue 2.x
      beforeCreate: prepare,

      created: launch,

      destroyed: function destroyed() {
        this._apolloSubscriptions.forEach(function (sub) {
          sub.unsubscribe();
        });
        this._apolloSubscriptions = null;
        if (this.$apollo) {
          this.$apollo = null;
        }
      }

    });
  }
};