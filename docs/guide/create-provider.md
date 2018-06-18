# Create a provider

Like `vue-router` or `vuex`, you need to specify the `apolloProvider` object on your root components. A provider holds the apollo client instances that can then be used by all the child components.

```javascript
const apolloProvider = new VueApollo({
  defaultClient: apolloClient,
})

new Vue({
  el: '#app',
  provide: apolloProvider.provide(),
  render: h => h(App),
})
```