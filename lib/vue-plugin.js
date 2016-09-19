import omit from 'lodash.omit';

let apolloClient = null;

class DollarApollo {
  constructor(vm) {
    this.vm = vm;
    this.querySubscriptions = {};
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

  option(key, options, watch) {
    const vm = this.vm;
    const $apollo = this;

    let query, observer, sub;
    let simpleQuery = false;

    let firstLoadingDone = false;

    let loadingKey = options.loadingKey;
    let loadingChangeCb = options.watchLoading;

    if (options.pollInterval) {
      watch = true;
    }

    if (typeof loadingChangeCb === 'function') {
      loadingChangeCb = loadingChangeCb.bind(vm);
    }

    // Simple query
    if (!options.query) {
      query = options;
      simpleQuery = true;
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

      if (simpleQuery) {

        $apollo.query({
          query
        }).then(nextResult).catch(catchError);

      } else if (watch) {

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

      } else {

        $apollo.query(generateApolloOptions(variables)).then(nextResult).catch(catchError);

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

      console.log(data, key);

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
        vm.$set(loadingKey, vm.$get(loadingKey) + value);
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
}

function prepare() {
  this._apolloSubscriptions = [];

  this.$apollo = new DollarApollo(this);

  let apollo = this.$options.apollo;

  if (apollo) {
    // One-time queries with $query(), called each time a Vue dependency is updated (using $watch)
    if (apollo.query) {
      for (let key in apollo.query) {
        this.$apollo.option(key, apollo.query[key], false);
      }
    }

    // Auto updating queries with $watchQuery(), re-called each time a Vue dependency is updated (using $watch)
    if (apollo.watchQuery) {
      for (let key in apollo.watchQuery) {
        this.$apollo.option(key, apollo.watchQuery[key], true);
      }
    }
  }
}

export default {
  install(Vue, options) {

    apolloClient = options.apolloClient;

    Vue.mixin({

      // Vue 1.x
      beforeCompile: prepare,
      // Vue 2.x
      beforeCreate: prepare,

      destroyed: function() {
        this._apolloSubscriptions.forEach((sub) => {
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
