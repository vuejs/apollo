# Usage in Vue components

After installing `vue-apollo` in your app, all your components can now use Apollo through the `apollo` special option.

## `apollo` options

To declare apollo queries in your Vue component, add the `apollo` object in the component options:

```js
new Vue({
  apollo: {
    // Apollo specific options
  },
})
```

In a `.vue` file:

```vue
<template>
  <div>My component</div>
</template>

<script>
export default {
  apollo: {
    // Vue-Apollo options here
  }
}
</script>
```

### Special options

In the `apollo` option, there are special options that begin with `$` in the `apollo` object.

Learn more about those special options in the [Special options section](./special-options.md).

## `$apollo`

All the components under the one which has the `apolloProvider` option have an `$apollo` helper available. This is the glue between your component and Apollo and it does all the heavy lifting for you (including automatic updates and teardowns).

You can access the [apollo-client](https://www.apollographql.com/docs/react/) instances with `this.$apollo.provider.defaultClient` or `this.$apollo.provider.clients.<key>` (for [Multiple clients](../multiple-clients.md)) in all your vue components.

If you are curious, see [$apollo API](../api/dollar-apollo.md).
