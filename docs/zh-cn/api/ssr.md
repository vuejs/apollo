# ApolloSSR

## 用法

详见 [SSR 指南](../guide/ssr.md)。

## 方法

### install

仅在服务端安装 SSR 插件：

```js
Vue.use(ApolloSSR)
```

你可以像这样传递附加选项：

```js
Vue.use(ApolloSSR, {
  fetchPolicy: 'network-only',
  suppressRenderErrors: false,
})
```

#### fetchPolicy

当预取一个 Apollo 查询时，建议覆盖 `fetchPolicy` 以强制查询发送。

默认值：`'network-only'`。

#### suppressRenderErrors

隐藏虚假渲染时的错误。

默认值：`false`。

### prefetchAll

预取所有队列中的组件定义，并在所有对应的 apollo 数据准备就绪时返回已解决的(resolved) promise。

```js
await ApolloSSR.prefetchAll (apolloProvider, componentDefs, context)
```

`context` 作为参数传递给智能查询中的 `prefetch` 选项。它可能包含路由和 store。

### getStates

将 apollo store 状态作为 JavaScript 对象返回。

```js
const states = ApolloSSR.getStates(apolloProvider, options)
```

`options` 的默认值是：

```js
{
  // 每个 apollo 客户端状态的 key 的前缀
  exportNamespace: '',
}
```

### exportStates

将 apollo store 状态作为字符串内的 JavaScript 代码返回。该代码可以直接注入到页面 HTML 的 `<script>` 标签中。

```js
const js = ApolloSSR.exportStates(apolloProvider, options)
```

`options` 的默认值是：

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

### globalPrefetch

允许你注册一个需要显式预取的组件。

简单示例如下：

```js
import MyComponent from '@/components/MyComponent.vue'

ApolloSSR.globalPrefetch(() => MyComponent)
```

你可以根据上下文禁用预取：

```js
ApolloSSR.globalPrefetch(context => {
  if (context.route.name === 'foo'){
    return MyComponent
  }
})
```

### mockInstance

在 `prefetchAll` 期间，应用程序组件树将使用虚假实例重新创建以使进程更快。如果你在模板或渲染函数中访问了像 `this.$http` 这样的辅助函数（通常为 `Undefined error`），你可以通过插件来修改虚假实例，以防止它们的渲染函数崩溃。建议 mock 这些辅助函数以提高性能。

```js
const noop = () => {}

ApolloSSR.mockInstance({
  apply: vm => {
    // Mock $http
    vm.$http = noop
  },
})
```
