# Special options

The special options begin with `$` in the `apollo` object.

- `$skip` to disable all queries and subscriptions (see below)
- `$skipAllQueries` to disable all queries (see below)
- `$skipAllSubscriptions` to disable all subscriptions (see below)
- `$deep` to watch with `deep: true` on the properties above when a function is provided
- `$error` to catch errors in a default handler (see `error` advanced options for smart queries)
- `$query` to apply default options to all the queries in the component

Example:

```html
<script>
export default {
  data () {
    return {
      loading: 0,
    }
  },
  apollo: {
    $query: {
      loadingKey: 'loading',
    },
    query1: { ... },
    query2: { ... },
  },
}
</script>
```

You can define in the apollo provider a default set of options to apply to the `apollo` definitions. For example:

```javascript
const apolloProvider = new VueApollo({
  defaultClient: apolloClient,
  defaultOptions: {
    // apollo options applied to all queries in components
    $query: {
      loadingKey: 'loading',
      fetchPolicy: 'cache-and-network',
    },
  },
})
```