# 特殊选项

`apollo` 对象中的特殊选项以 `$` 开头表示。

- `$skip` 用于禁用所有查询和订阅（后文详述）
- `$skipAllQueries` 用于禁用所有查询（后文详述）
- `$skipAllSubscriptions` 用于禁用所有订阅（后文详述）
- `$deep` 用于当为以上的属性提供函数时，通过 `deep: true` 进行监听
- `$error` 用于捕获默认处理函数中的错误（详见智能查询的 `error` 高级选项）
- `$query` 用于将默认选项应用于组件中的所有查询

示例：

```vue
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

你可以在 apollo provider 中为 `apollo` 定义一套默认选项。例如：

```js
const apolloProvider = new VueApollo({
  defaultClient: apolloClient,
  defaultOptions: {
    // 将应用于组件中的所有查询的 apollo 选项
    $query: {
      loadingKey: 'loading',
      fetchPolicy: 'cache-and-network',
    },
  },
})
```

## 全部跳过

你可以使用 `skipAllQueries` 禁用组件的所有查询，使用 `skipAllSubscriptions` 禁用所有订阅，或是使用 `skipAll` 将两者全部禁用：

```js
this.$apollo.skipAllQueries = true
this.$apollo.skipAllSubscriptions = true
this.$apollo.skipAll = true
```

你也可以在组件的 `apollo` 选项中声明这些属性。它们可以是布尔值：

```js
apollo: {
  $skipAll: true
}
```

或是响应式函数：

```js
apollo: {
  $skipAll () {
    return this.foo === 42
  }
}
```
