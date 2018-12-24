# Smart Query

Each query declared in the `apollo` definition (that is, which doesn't start with a `$` char) in a component results in the creation of a smart query object.

## Options

- `query`: GraphQL document (can be a file or a `gql` string).
- `variables`: Object or reactive function that returns an object. Each key will be mapped with a `'$'` in the GraphQL document, for example `foo` will become `$foo`.
- `throttle`: throttle variables updates (in ms).
- `debounce`: debounce variables updates (in ms).
- `pollInterval`: auto update using polling (which means refetching every `x` ms).
- `update(data) {return ...}` to customize the value that is set in the vue property, for example if the field names don't match.
- `result(ApolloQueryResult)` is a hook called when a result is received (see documentation for [ApolloQueryResult](https://github.com/apollographql/apollo-client/blob/master/packages/apollo-client/src/core/types.ts)).
- `error(error)` is a hook called when there are errors. `error` is an Apollo error object with either a `graphQLErrors` property or a `networkError` property.
- `loadingKey` will update the component data property you pass as the value. You should initialize this property to `0` in the component `data()` hook. When the query is loading, this property will be incremented by 1; when it is no longer loading, it will be decremented by 1. That way, the property can represent a counter of currently loading queries.
- `watchLoading(isLoading, countModifier)` is a hook called when the loading state of the query changes. The `countModifier` parameter is either equal to `1` when the query is loading, or `-1` when the query is no longer loading.
- `manual` is a boolean to disable the automatic property update. If you use it, you then need to specify a `result` callback (see example below).
- `deep` is a boolean to use `deep: true` on Vue watchers.
- `subscribeToMore`: an object or an array of object which are [subscribeToMore options](../guide/apollo/subscriptions.md#subscribetomore).
- `prefetch` is either a boolean or a function to determine if the query should be prefetched. See [Server-Side Rendering](../guide/ssr.md).

Example:

```js
// Apollo-specific options
apollo: {
  // Advanced query with parameters
  // The 'variables' method is watched by vue
  pingMessage: {
    query: gql`query PingMessage($message: String!) {
      ping(message: $message)
    }`,
    // Reactive parameters
    variables () {
      // Use vue reactive properties here
      return {
        message: this.pingInput,
      }
    },
    // Variables: deep object watch
    deep: false,
    // We use a custom update callback because
    // the field names don't match
    // By default, the 'pingMessage' attribute
    // would be used on the 'data' result object
    // Here we know the result is in the 'ping' attribute
    // considering the way the apollo server works
    update (data) {
      console.log(data)
      // The returned value will update
      // the vue property 'pingMessage'
      return data.ping
    },
    // Optional result hook
    result ({ data, loading, networkStatus }) {
      console.log('We got some result!')
    },
    // Error handling
    error (error) {
      console.error('We\'ve got an error!', error)
    },
    // Loading state
    // loadingKey is the name of the data property
    // that will be incremented when the query is loading
    // and decremented when it no longer is.
    loadingKey: 'loadingQueriesCount',
    // watchLoading will be called whenever the loading state changes
    watchLoading (isLoading, countModifier) {
      // isLoading is a boolean
      // countModifier is either 1 or -1
    },
  },
},
```

If you use `ES2015`, you can also write the `update` like this:

```js
update: data => data.ping
```

Manual mode example:

```js
{
  query: gql`...`,
  manual: true,
  result ({ data, loading }) {
    if (!loading) {
      this.items = data.items
    }
  },
}
```

## Properties

### Skip

You can pause or unpause with `skip`:

```js
this.$apollo.queries.users.skip = true
```

### loading

Whether the query is loading:

```js
this.$apollo.queries.users.loading
```

## Methods

### refresh

Stops and restarts the query:

```js
this.$apollo.queries.users.refresh()
```

### start

Starts the query:

```js
this.$apollo.queries.users.start()
```

### stop

Stops the query:

```js
this.$apollo.queries.users.stop()
```

### fetchMore

Load more data for pagination:

```js
this.page++

this.$apollo.queries.tagsPage.fetchMore({
  // New variables
  variables: {
    page: this.page,
    pageSize,
  },
  // Transform the previous result with new data
  updateQuery: (previousResult, { fetchMoreResult }) => {
    const newTags = fetchMoreResult.tagsPage.tags
    const hasMore = fetchMoreResult.tagsPage.hasMore

    this.showMoreEnabled = hasMore

    return {
      tagsPage: {
        __typename: previousResult.tagsPage.__typename,
        // Merging the tag list
        tags: [...previousResult.tagsPage.tags, ...newTags],
        hasMore,
      },
    }
  },
})
```

### subscribeToMore

Subscribe to more data using GraphQL subscriptions:

```js
// We need to unsubscribe before re-subscribing
if (this.tagsSub) {
  this.tagsSub.unsubscribe()
}
// Subscribe on the query
this.tagsSub = this.$apollo.queries.tags.subscribeToMore({
  document: TAG_ADDED,
  variables: {
    type,
  },
  // Mutate the previous result
  updateQuery: (previousResult, { subscriptionData }) => {
    // If we added the tag already don't do anything
    // This can be caused by the `updateQuery` of our addTag mutation
    if (previousResult.tags.find(tag => tag.id === subscriptionData.data.tagAdded.id)) {
      return previousResult
    }

    return {
      tags: [
        ...previousResult.tags,
        // Add the new tag
        subscriptionData.data.tagAdded,
      ],
    }
  },
})
```

### refetch

Fetch the query again, optionally with new variables:

```js
this.$apollo.queries.users.refetch()
// With new variables
this.$apollo.queries.users.refetch({
  friendsOf: 'id-user'
})
```

### setVariables

Update the variables on the query and refetch it if they have changed. To force a refetch, use `refetch`.

```js
this.$apollo.queries.users.setVariables({
  friendsOf: 'id-user'
})
```

### setOptions

Update the Apollo [watchQuery](https://www.apollographql.com/docs/react/api/apollo-client.html#ApolloClient.watchQuery) options and refetch:

```js
this.$apollo.queries.users.setOptions({
  fetchPolicy: 'cache-and-network'
})
```

### startPolling

Start an auto update using polling (which means refetching every `x` ms):

```js
this.$apollo.queries.users.startPolling(2000) // ms
```

### stopPolling

Stop the polling:

```js
this.$apollo.queries.users.stopPolling()
```
