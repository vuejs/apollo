# Setup

Make sure you have [installed Apollo Client](../guide/installation.md).

## 1. Install @vue/apollo-components

```
npm install --save @vue/apollo-option @vue/apollo-components
```

Or:

```
yarn add @vue/apollo-option @vue/apollo-components
```

## 2. Install the plugin into Vue

```js
import Vue from 'vue'
import VueApollo from '@vue/apollo-option'
import VueApolloComponents from '@vue/apollo-components'

Vue.use(VueApollo)
Vue.use(VueApolloComponents)
```

## 3. Inject the Apollo provider

The provider holds the Apollo client instances that can then be used by all the child components.

```js
const apolloProvider = new VueApollo({
  defaultClient: apolloClient,
})
```

Add it to your app with the `apolloProvider` option:

```js
new Vue({
  el: '#app',
  // inject apolloProvider here like vue-router or vuex
  apolloProvider,
  render: h => h(App),
})
```

You are now ready to use Apollo in your components!
