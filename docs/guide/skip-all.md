# Skip all

You can disable all the queries for the component with `skipAllQueries`, all the subscriptions with `skipAllSubscriptions` and both with `skipAll`:

```javascript
this.$apollo.skipAllQueries = true
this.$apollo.skipAllSubscriptions = true
this.$apollo.skipAll = true
```

You can also declare these properties in the `apollo` option of the component. They can be booleans:

```javascript
apollo: {
  $skipAll: true
}
```

Or reactive functions:

```javascript
apollo: {
  $skipAll () {
    return this.foo === 42
  }
}
```