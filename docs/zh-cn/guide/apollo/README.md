# 在 Vue 组件中使用 Apollo

要在你的 Vue 组件中声明 apollo 查询，只需添加一个 `apollo` 对象：

```js
new Vue({
    apollo: {
        // Apollo 的具体选项
    },
})
```

在你的每个 vue 组件中，你都可以通过 `this.$apollo.provider.defaultClient` 或 `this.$apollo.provider.clients.<key>`（用于 [多客户端](../multiple-clients.md)）来访问 [apollo-client](https://www.apollographql.com/docs/react/) 实例。

## 查询（Queries）

为每个你需要通过 Apollo 的查询结果提供数据的 Vue 属性，在 `apollo` 对象中添加一个对应属性。

```js
import gql from 'graphql-tag'

export default {
  apollo: {
    // 简单的查询，将更新 'hello' 这个 vue 属性
    hello: gql`query { hello }`,
  },
}
```

更多细节请查看 [查询](./queries.md) 一章。

## 变更（Mutations）

使用 `this.$apollo.mutate` 发送变更语句：

```js
methods: {
  async addTag() {
    // 调用 graphql 变更
    const result = await this.$apollo.mutate({
      // 查询语句
      mutation: gql`mutation ($label: String!) {
        addTag(label: $label) {
          id
          label
        }
      }`,
      // 参数
      variables: {
        label: this.newTag,
      },
    })
  }
}
```

更多细节请查看 [变更](./mutations.md) 一章。

## 特殊选项

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