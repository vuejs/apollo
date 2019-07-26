# 智能订阅

每个在组件中的 `apollo.$subscribe` 选项中声明的订阅都会创建一个智能订阅对象。

## 选项

- `query`：GraphQL 文档（可以是一个文件或一个 `gql` 字符串）。
- `variables`：对象或返回对象的响应式函数。每个键将用 `'$'` 映射到 GraphQL 文档中，例如 `foo` 将变为 `$foo`。
- `throttle`：变量更新节流时间（毫秒）。
- `debounce`：变量更新防抖时间（毫秒）。
- `result(data, key)` 是收到结果时调用的钩子。
- `error(error)` 是有错误时调用的钩子。`error` 是一个具有 `graphQLErrors` 属性或 `networkError` 属性的 Apollo 错误对象。

## 属性

### Skip

你可以使用 `skip` 来暂停或停止暂停：

```js
this.$apollo.subscriptions.users.skip = true
```

## 方法

### refresh

停止并重新启动查询：

```js
this.$apollo.subscriptions.users.refresh()
```

### start

开始查询：

```js
this.$apollo.subscriptions.users.start()
```

### stop

停止查询：

```js
this.$apollo.subscriptions.users.stop()
```
