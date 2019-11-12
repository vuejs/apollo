# 在 Vue 组件中的用法

在你的应用程序中安装了 `vue-apollo` 之后，所有组件都可以通过 `apollo` 这一特殊选项来使用 Apollo。

## `apollo` 选项

要在你的 Vue 组件中声明 apollo 查询，在组件的选项中添加 `apollo` 对象：

```js
new Vue({
  apollo: {
    // Apollo 的具体选项
  },
})
```

在一个 `.vue` 文件中：

```vue
<template>
  <div>My component</div>
</template>

<script>
export default {
  apollo: {
    // Vue-Apollo 选项放在这里
  }
}
</script>
```

## `$apollo`

在一个有着 `apolloProvider` 选项的组件之下的所有组件都可以使用一个 `$apollo` 辅助函数。这是你的组件和 Apollo 之间的胶水层，它可以为你完成所有繁重的工作（包括自动更新和销毁）。

在你的每个 vue 组件中，你都可以通过 `this.$apollo.provider.defaultClient` 或 `this.$apollo.provider.clients.<key>`（用于 [多客户端](../multiple-clients.md)）来访问 [apollo-client](https://www.apollographql.com/docs/react/) 实例。

如果你很好奇，请查看 [$apollo API](../../api/dollar-apollo.md)。

## 查询（Queries）

为每个你需要通过 Apollo 的查询结果提供数据的 Vue 属性，在 `apollo` 对象中添加一个对应属性。

```vue
<template>
  <div>{{ hello }}</div>
</template>

<script>
import gql from 'graphql-tag'

export default {
  apollo: {
    // 简单的查询，将更新 'hello' 这个 vue 属性
    hello: gql`query {
      hello
    }`,
  },
}
</script>
```

请查看 [查询](./queries.md) 一章以了解更多。

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

请查看 [变更](./mutations.md) 一章以了解更多。

## 特殊选项

`apollo` 对象中的特殊选项以 `$` 开头表示。

请查看 [特殊选项](./special-options.md) 一章以了解更多。
