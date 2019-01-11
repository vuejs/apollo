# 智能查询

在组件的 `apollo` 定义中声明的每个查询（不以 `$` 字符开头）都会创建一个智能查询对象。

## 选项

- `query`：GraphQL 文档（可以是一个文件或一个 `gql` 字符串）。
- `variables`：对象或返回对象的响应式函数。每个键将用 `'$'` 映射到 GraphQL 文档中，例如 `foo` 将变为 `$foo`。
- `throttle`：变量更新节流时间（毫秒）。
- `debounce`：变量更新防抖时间（毫秒）。
- `pollInterval`：使用轮询自动更新的时间（表示每隔 `x` 毫秒重新获取一次）。
- `update(data) {return ...}` 用来自定义设置到 vue 属性中的值，例如当字段名称不匹配时。
- `result(ApolloQueryResult, key)` 是收到结果时调用的钩子（更多参见 [ApolloQueryResult](https://github.com/apollographql/apollo-client/blob/master/packages/apollo-client/src/core/types.ts) 的文档）。`key` 是在 `apollo` 选项中定义此查询时使用的键名。
- `error(error)` 是有错误时调用的钩子。`error` 是一个具有 `graphQLErrors` 属性或 `networkError` 属性的 Apollo 错误对象。
- `loadingKey` 将更新你传递的值所对应的组件数据属性。你应该在组件的 `data()` 钩子中将此属性初始化为 `0` 。当查询正在加载时，此属性将增加 1；当不再加载时，它将减去 1。这样，该属性可以表示当前正在加载中的查询的计数器。
- `watchLoading(isLoading, countModifier)` 是一个在查询的加载状态发生变化时调用的钩子。`countModifier` 参数当查询正在加载时等于 `1`，不再加载时为 `-1`。
- `manual` 是一个禁用自动属性更新的布尔值。如果使用它，你需要指定一个 `result` 回调函数（参见下面的示例）。
- `deep` 是一个在 Vue 侦听器上使用 `deep: true` 的布尔值。
- `subscribeToMore`：一个或一组 [subscribeToMore 选项](../guide/apollo/subscriptions.md#subscribetomore) 对象。
- `prefetch` 是一个布尔值或函数来确定是否应该预取查询。详见 [服务端渲染](../guide/ssr.md)。

示例：

```js
// Apollo 具体选项
apollo: {
  // 带参数的高级查询
  // vue 会侦听 'variables' 方法
  pingMessage: {
    query: gql`query PingMessage($message: String!) {
      ping(message: $message)
    }`,
    // 响应式参数
    variables () {
      // 在这里使用 vue 的响应式属性
      return {
        message: this.pingInput,
      }
    },
    // 变量：深度对象侦听
    deep: false,
    // 我们使用自定义的 update 回调函数，因为字段名称不匹配
    // 默认情况下，将使用 'data' 结果对象上的 'pingMessage' 属性
    // 考虑到 apollo 服务端的工作方式，我们知道结果是在 'ping' 属性中
    update (data) {
      console.log(data)
      // 返回的值将更新 vue 属性 'pingMessage'
      return data.ping
    },
    // 可选结果钩子
    result ({ data, loading, networkStatus }) {
      console.log('We got some result!')
    },
    // 错误处理
    error (error) {
      console.error('We\'ve got an error!', error)
    },
    // 加载状态
    // loadingKey 是数据属性的名称
    // 在查询正在加载时将递增，不再加载时递减
    loadingKey: 'loadingQueriesCount',
    // 当加载状态发生变化时会调用 watchLoading
    watchLoading (isLoading, countModifier) {
      // isLoading 是一个布尔值
      // countModifier 为 1 或 -1
    },
  },
},
```

如果你使用 `ES2015`，`update` 也可以这样写：

```js
update: data => data.ping
```

手动模式示例：

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

## 属性

### Skip

你可以使用 `skip` 来暂停或停止暂停：

```js
this.$apollo.queries.users.skip = true
```

### loading

查询是否正在加载中：

```js
this.$apollo.queries.users.loading
```

## 方法

### refresh

停止并重新启动查询：

```js
this.$apollo.queries.users.refresh()
```

### start

开始查询：

```js
this.$apollo.queries.users.start()
```

### stop

停止查询：

```js
this.$apollo.queries.users.stop()
```

### fetchMore

为分页加载更多数据：

```js
this.page++

this.$apollo.queries.tagsPage.fetchMore({
  // 新的变量
  variables: {
    page: this.page,
    pageSize,
  },
  // 用新数据转换之前的结果
  updateQuery: (previousResult, { fetchMoreResult }) => {
    const newTags = fetchMoreResult.tagsPage.tags
    const hasMore = fetchMoreResult.tagsPage.hasMore

    this.showMoreEnabled = hasMore

    return {
      tagsPage: {
        __typename: previousResult.tagsPage.__typename,
        // 合并标签列表
        tags: [...previousResult.tagsPage.tags, ...newTags],
        hasMore,
      },
    }
  },
})
```

### subscribeToMore

使用 GraphQL 订阅来订阅更多数据：

```js
// 我们需要在重新订阅之前取消订阅
if (this.tagsSub) {
  this.tagsSub.unsubscribe()
}
// 在查询上订阅
this.tagsSub = this.$apollo.queries.tags.subscribeToMore({
  document: TAG_ADDED,
  variables: {
    type,
  },
  // 变更之前的结果
  updateQuery: (previousResult, { subscriptionData }) => {
    // 如果我们在没有做操作的情况下已经添加了标签
    // 这可能是由 addTag 变更上的 `updateQuery` 导致
    if (previousResult.tags.find(tag => tag.id === subscriptionData.data.tagAdded.id)) {
      return previousResult
    }

    return {
      tags: [
        ...previousResult.tags,
        // 添加新的标签
        subscriptionData.data.tagAdded,
      ],
    }
  },
})
```

### refetch

重新获取查询，可选择使用新变量：

```js
this.$apollo.queries.users.refetch()
// 使用新变量
this.$apollo.queries.users.refetch({
  friendsOf: 'id-user'
})
```

### setVariables

更新查询中的变量，如果发生了改变则重新获取查询。要强制重新获取，请使用 `refetch`。

```js
this.$apollo.queries.users.setVariables({
  friendsOf: 'id-user'
})
```

### setOptions

更新 Apollo [watchQuery](https://www.apollographql.com/docs/react/api/apollo-client.html#ApolloClient.watchQuery) 选项并重新获取：

```js
this.$apollo.queries.users.setOptions({
  fetchPolicy: 'cache-and-network'
})
```

### startPolling

使用轮询启动自动更新（这意味着每隔 `x` ms 进行重新获取）：

```js
this.$apollo.queries.users.startPolling(2000) // ms
```

### stopPolling

停止轮询：

```js
this.$apollo.queries.users.stopPolling()
```
