# ApolloSSR

## Usage

See [SSR guide](../guide/ssr.md).

## Methods

### install

Install the SSR plugin only on the server with:

```js
Vue.use(ApolloSSR)
```

You can pass additional options like this:

```js
Vue.use(ApolloSSR, {
  fetchPolicy: 'network-only',
  suppressRenderErrors: false,
})
```

#### fetchPolicy

When an Apollo query is prefetched, it's recommended to override `fetchPolicy` to force the queries to happen.

Default value: `'network-only'`.

#### suppressRenderErrors

Silent the fake render errors.

Default value: `false`.

### prefetchAll

Prefetches all queued component definitions and returns a promise resolved when all corresponding apollo data is ready.

```js
await ApolloSSR.prefetchAll (apolloProvider, componentDefs, context)
```

`context` is passed as the argument to the `prefetch` options inside the smart queries. It may contain the route and the store.

### getStates

Returns the apollo stores states as JavaScript objects.

```js
const states = ApolloSSR.getStates(apolloProvider, options)
```

`options` defaults to:

```js
{
  // Prefix for the keys of each apollo client state
  exportNamespace: '',
}
```

### exportStates

Returns the apollo stores states as JavaScript code inside a String. This code can be directly injected to the page HTML inside a `<script>` tag.

```js
const js = ApolloSSR.exportStates(apolloProvider, options)
```

`options` defaults to:

```js
{
  // Global variable name
  globalName: '__APOLLO_STATE__',
  // Global object on which the variable is set
  attachTo: 'window',
  // Prefix for the keys of each apollo client state
  exportNamespace: '',
}
```

### globalPrefetch

Allow you to register a component to be prefetched explicitely.

Simple example:

```js
import MyComponent from '@/components/MyComponent.vue'

ApolloSSR.globalPrefetch(() => MyComponent)
```

You can disable prefetching depending on context:

```js
ApolloSSR.globalPrefetch(context => {
  if (context.route.name === 'foo'){
    return MyComponent
  }
})
```

### mockInstance

During `prefetchAll`, the app components tree is re-created with fake instances so the process is faster. You can apply plugins to modify the fake instances to prevent their render functions to crash if you have helpers like `this.$http` that is accessed in the template or render function (typically `Undefined error`). It's recommended to mock those helpers to improve performance.

```js
const noop = () => {}

ApolloSSR.mockInstance({
  apply: vm => {
    // Mock $http
    vm.$http = noop
  },
})
```
