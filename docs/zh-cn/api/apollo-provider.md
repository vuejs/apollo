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
    // 详见 'apollo' 的定义
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

## 方法

### provide

使用此方法将 provider 注入应用程序：

```js
new Vue({
  el: '#app',
  provide: apolloProvider.provide(),
  render: h => h(App),
})
```

### prefetchAll

（SSR）预取所有队列中的组件定义，并在所有对应的 apollo 数据准备就绪时返回已解决的(resolved) promise。

```js
await apolloProvider.prefetchAll (context, componentDefs, options)
```

`context` 作为参数传递给智能查询中的 `prefetch` 选项。它可能包含路由和 store。

`options` 的默认值是：

```js
{
  // 包含使用 `willPrefetch` 注册的路由之外的组件
  includeGlobal: true,
}
```

### getStates

（SSR）将 apollo store 状态作为 JavaScript 对象返回。

```js
const states = apolloProvider.getStates(options)
```

`options` 的默认值是：

```js
{
  // 每个 apollo 客户端状态的 key 的前缀
  exportNamespace: '',
}
```

### exportStates

（SSR）将 apollo store 状态作为字符串内的 JavaScript 代码返回。该代码可以直接注入到页面 HTML 的 `<script>` 标签中。

```js
const js = apolloProvider.exportStates(options)
```

`options` defaults to:

```js
{
  // 全局变量名
  globalName: '__APOLLO_STATE__',
  // 变量设置到的全局对象
  attachTo: 'window',
  // 每个 apollo 客户端状态的 key 的前缀
  exportNamespace: '',
}
```

## 其他方法

### willPrefetch

使用 `willPrefetch` 方法，来告诉 vue-apollo 需要预取一些未在 `router-view` 中被使用的组件因此不在 vue-router 的 `matchedComponents` 中）：

```js
import { willPrefetch } from 'vue-apollo'

export default willPrefetch({
  apollo: {
    allPosts: {
      query: gql`query AllPosts {
        allPosts {
          id
          imageUrl
          description
        }
      }`,
      prefetch: true, // 别忘了这个
    }
  }
})
```

