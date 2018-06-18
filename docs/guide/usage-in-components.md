# Usage in components

To declare apollo queries in your Vue component, add an `apollo` object :

```javascript
new Vue({
    apollo: {
        // Apollo specific options
    },
})
```

You can access the [apollo-client](https://www.apollographql.com/docs/react/) instances with `this.$apollo.provider.defaultClient` or `this.$apollo.provider.clients.<key>` (for [Multiple clients](#multiple-clients)) in all your vue components.