# ApolloSubscribeToMore

你可以使用 `ApolloSubscribeToMore`（或 `apollo-subscribe-to-more`）组件订阅更多数据。你可以在一个 `<ApolloQuery>` 组件中放置任意数量的订阅组件。

::: tip
如果更新关联到现有对象（例如更改某个字段的值），则不需要 `updateQuery`，因为 Apollo 客户端能够自动更新缓存。
:::

这是一个简单的例子：

```vue
<template>
  <ApolloQuery :query="...">
    <ApolloSubscribeToMore
      :document="require('../gql/MessageAdded.gql')"
      :variables="{ channel }"
      :updateQuery="onMessageAdded"
    />

    <!-- ... -->
  </ApolloQuery>
</template>

<script>
export default {
  data () {
    return {
      channel: 'general',
    }
  },

  methods: {
    onMessageAdded (previousResult, { subscriptionData }) {
      // 之前的结果是不可变的
      const newResult = {
        messages: [...previousResult.messages],
      }
      // 添加问题到列表中
      newResult.messages.push(subscriptionData.data.messageAdded)
      return newResult
    },
  },
}
</script>
```

更多参见 [API 参考](../../api/apollo-subscribe-to-more.md).

## `updateQuery` 的示例

将新项添加到缓存中：

```js
methods: {
  onMessageAdded (previousResult, { subscriptionData }) {
    // 之前的结果是不可变的
    const newResult = {
      messages: [...previousResult.messages],
    }
    // 添加问题到列表中
    newResult.messages.push(subscriptionData.data.messageAdded)
    return newResult
  }
}
```

从缓存中删除一项：

```js
methods: {
  onMessageAdded (previousResult, { subscriptionData }) {
    const removedMessage = subscriptionData.data.messageRemoved
    const index = previousResult.messages.findIndex(
      m => m.id === removedMessage.id
    )

    if (index === -1) return previousResult

    // 之前的结果是不可变的
    const newResult = {
      messages: [...previousResult.messages],
    }
    // 从列表中移除问题
    newResult.messages.splice(index, 1)
    return newResult
  }
}
```
