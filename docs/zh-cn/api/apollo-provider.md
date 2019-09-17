# ApolloProvider

## 构造函数

```js
const apolloProvider = new VueApollo({
  // 支持多客户端
  // 在查询中使用 'client' 选项
  // 或在 apollo 定义中使用 '$client'
  clients: {
    a: apolloClientA,
    b: apolloClientB,
  },
  // 默认客户端
  defaultClient: apolloClient,
  // 'apollo' 对象的默认定义
  defaultOptions: {
    // 详见 'apollo' 的定义
    // 例如：默认查询选项
    $query: {
      loadingKey: 'loading',
      fetchPolicy: 'cache-and-network',
    },
  },
  // 查看所有查询的加载状态
  // 详见 '智能查询 > 选项 > watchLoading'
  watchLoading (isLoading, countModifier) {
    loading += countModifier
    console.log('Global loading', loading, countModifier)
  },
  // 所有智能查询和订阅的全局错误处理函数
  errorHandler (error) {
    console.log('Global error handler')
    console.error(error)
  },
  // 全局关闭 ssr 的预取
  prefetch: Boolean,
})
```

在你的 Vue 应用程序中使用 apollo provider：

```js
new Vue({
  el: '#app',
  apolloProvider,
  render: h => h(App),
})
```
