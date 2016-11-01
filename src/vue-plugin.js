import omit from 'lodash.omit';
import { print } from 'graphql-tag/printer';

let apolloClient = null;

let defineReactive = function() {};

// quick way to add the subscribe and unsubscribe functions to the network interface
function addGraphQLSubscriptions(networkInterface, wsClient) {
  return Object.assign(networkInterface, {
    subscribe(request, handler) {
      return wsClient.subscribe({
        query: print(request.query),
        variables: request.variables,
      }, handler);
    },
    unsubscribe(id) {
      wsClient.unsubscribe(id);
    },
  });
}

class DollarApollo {
  constructor(vm) {
    this.vm = vm;
    this.queries = {};
    this.subscriptions = {};
  }

  get client() {
    return apolloClient;
  }

  get query() {
    return this.client.query;
  }

  watchQuery(options) {
    const vm = this.vm;
    const observable = this.client.watchQuery(options);
    const _subscribe = observable.subscribe.bind(observable);
    observable.subscribe = (function(options) {
      let sub = _subscribe(options);
      vm._apolloSubscriptions.push(sub);
      return sub;
    }).bind(observable);
    return observable;
  }

  get mutate() {
    return this.client.mutate;
  }

  subscribe(options) {
    const vm = this.vm;
    const observable = this.client.subscribe(options);
    const _subscribe = observable.subscribe.bind(observable);
    observable.subscribe = (function(options) {
      let sub = _subscribe(options);
      vm._apolloSubscriptions.push(sub);
      return sub;
    }).bind(observable);
    return observable;
  }

  option(key, options) {
    const vm = this.vm;
    const $apollo = this;

    let query, observer, sub;

    let firstLoadingDone = false;

    let loadingKey = options.loadingKey;
    let loadingChangeCb = options.watchLoading;

    if (typeof loadingChangeCb === 'function') {
      loadingChangeCb = loadingChangeCb.bind(vm);
    }

    // Simple query
    if (!options.query) {
      query = options;
      options = {
        query,
      };
    }

    function generateApolloOptions(variables) {
      const apolloOptions = omit(options, [
        'variables',
        'watch',
        'update',
        'result',
        'error',
        'loadingKey',
        'watchLoading',
      ]);
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
      } else if(observer) {
        // Update variables
        observer.setVariables(variables);
      } else {
        if (sub) {
          sub.unsubscribe();
        }

        // Create observer
        observer = $apollo.watchQuery(generateApolloOptions(variables));
        $apollo.queries[key] = observer;

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

    function nextResult({ data }) {
      applyData(data);
    }

    function applyData(data) {
      loadingDone();

      if (typeof options.update === 'function') {
        vm[key] = options.update.call(vm, data);
      } else if (data[key] === undefined) {
        console.error(`Missing ${key} attribute on result`, data);
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
        console.error(`GraphQL execution errors for query ${query}`);
        for (let e of error.graphQLErrors) {
          console.error(e);
        }
      } else if (error.networkError) {
        console.error(`Error sending the query ${query}`, error.networkError);
      } else {
        console.error(error);
      }

      if (typeof options.error === 'function') {
        options.error(error);
      }
    }
  }

  subscribeOption(key, options) {
    const vm = this.vm;
    const $apollo = this;

    let observer, sub;

    function generateApolloOptions(variables) {
      const apolloOptions = omit(options, [
        'variables',
        'result',
        'error',
      ]);
      apolloOptions.variables = variables;
      return apolloOptions;
    }

    function q(variables) {
      if (sub) {
        sub.unsubscribe();
      }

      // Create observer
      observer = $apollo.subscribe(generateApolloOptions(variables));
      $apollo.subscriptions[key] = observer;

      // Create subscription
      sub = observer.subscribe({
        next: nextResult,
        error: catchError
      });
    }

    if (typeof options.variables === 'function') {
      vm.$watch(options.variables.bind(vm), q, {
        immediate: true
      });
    } else {
      q(options.variables);
    }

    function nextResult(data) {
      if (typeof options.result === 'function') {
        options.result.call(vm, data);
      }
    }

    function catchError(error) {
      loadingDone();

      if (error.graphQLErrors && error.graphQLErrors.length !== 0) {
        console.error(`GraphQL execution errors for subscription ${query}`);
        for (let e of error.graphQLErrors) {
          console.error(e);
        }
      } else if (error.networkError) {
        console.error(`Error sending the subscription ${query}`, error.networkError);
      } else {
        console.error(error);
      }

      if (typeof options.error === 'function') {
        options.error(error);
      }
    }
  }
}

const prepare = function prepare() {
  this._apolloSubscriptions = [];

  // Lazy creation
  Object.defineProperty(this, '$apollo', {
    get: () => {
      if(!this._apollo) {
        this._apollo = new DollarApollo(this);
      }
      return this._apollo;
    }
  });

  // Prepare properties
  let apollo = this.$options.apollo;
  if (apollo) {
    this._apolloQueries = omit(apollo, [
      'subscribe',
    ]);

    // watchQuery
    for (let key in this._apolloQueries) {
      // this.$data[key] = null;
      defineReactive(this, key, null);
    }
  }
}

const launch = function launch() {
  if (this._apolloQueries) {
    // watchQuery
    for (let key in this._apolloQueries) {
      this.$apollo.option(key, this._apolloQueries[key]);
    }
  }

  let apollo = this.$options.apollo;
  if(apollo && apollo.subscribe) {
    for (let key in apollo.subscribe) {
      this.$apollo.subscribeOption(key, apollo.subscribe[key]);
    }
  }
}

module.exports = {
  addGraphQLSubscriptions,

  install(Vue, options) {

    defineReactive = Vue.util.defineReactive;

    apolloClient = options.apolloClient;

    Vue.mixin({

      // Vue 1.x
      init: prepare,
      // Vue 2.x
      beforeCreate: prepare,

      created: launch,

      destroyed: function() {
        this._apolloSubscriptions.forEach((sub) => {
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
