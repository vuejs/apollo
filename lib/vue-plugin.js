'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash.omit');

var _lodash2 = _interopRequireDefault(_lodash);

var _printer = require('graphql-tag/printer');

var _smartApollo = require('./smart-apollo');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var apolloClient = null;

var defineReactive = function defineReactive() {};

// quick way to add the subscribe and unsubscribe functions to the network interface
function addGraphQLSubscriptions(networkInterface, wsClient) {
  return Object.assign(networkInterface, {
    subscribe: function subscribe(request, handler) {
      return wsClient.subscribe({
        query: (0, _printer.print)(request.query),
        variables: request.variables
      }, handler);
    },
    unsubscribe: function unsubscribe(id) {
      wsClient.unsubscribe(id);
    }
  });
}

var DollarApollo = function () {
  function DollarApollo(vm) {
    _classCallCheck(this, DollarApollo);

    this.vm = vm;
    this.queries = {};
    this.subscriptions = {};
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
      };
      return observable;
    }
  }, {
    key: 'subscribe',
    value: function subscribe(options) {
      var vm = this.vm;
      var observable = this.client.subscribe(options);
      var _subscribe = observable.subscribe.bind(observable);
      observable.subscribe = function (options) {
        var sub = _subscribe(options);
        vm._apolloSubscriptions.push(sub);
        return sub;
      };
      return observable;
    }
  }, {
    key: 'option',
    value: function option(key, options) {
      this.queries[key] = new _smartApollo.SmartQuery(this.vm, key, options);
    }
  }, {
    key: 'subscribeOption',
    value: function subscribeOption(key, options) {
      this.subscriptions[key] = new _smartApollo.SmartSubscription(this.vm, key, options);
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

var prepare = function prepare() {
  var _this = this;

  this._apolloSubscriptions = [];

  // Lazy creation
  Object.defineProperty(this, '$apollo', {
    get: function get() {
      if (!_this._apollo) {
        _this._apollo = new DollarApollo(_this);
      }
      return _this._apollo;
    }
  });

  // Prepare properties
  var apollo = this.$options.apollo;
  if (apollo) {
    this._apolloQueries = (0, _lodash2.default)(apollo, ['subscribe']);

    // watchQuery
    for (var key in this._apolloQueries) {
      // this.$data[key] = null;
      defineReactive(this, key, null);
    }
  }
};

var launch = function launch() {
  if (this._apolloQueries) {
    // watchQuery
    for (var key in this._apolloQueries) {
      this.$apollo.option(key, this._apolloQueries[key]);
    }
  }

  var apollo = this.$options.apollo;
  if (apollo && apollo.subscribe) {
    for (var _key in apollo.subscribe) {
      this.$apollo.subscribeOption(_key, apollo.subscribe[_key]);
    }
  }
};

module.exports = {
  addGraphQLSubscriptions: addGraphQLSubscriptions,

  install: function install(Vue, options) {
    defineReactive = Vue.util.defineReactive;

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
        if (this._apollo) {
          this._apollo = null;
        }
      }

    });
  }
};