# ApolloSSR

## 用法

详见 [SSR 指南](../guide/ssr.md).

## 方法

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
