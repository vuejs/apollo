# ApolloSubscribeToMore 组件

示例：

```vue
<template>
  <ApolloQuery :query="...">
    <ApolloSubscribeToMore
      :document="gql => gql`
        subscription messageChanged ($channelId: ID!) {
          messageAdded (channelId: $channelId) {
            type
            message {
              id
              text
            }
          }
        }
      `"
      :variables="{ channelId }"
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
      // 以前的结果是不可变的
      const newResult = {
        messages: [...previousResult.messages],
      }
      // 添加新内容到列表
      newResult.messages.push(subscriptionData.data.messageAdded)
      return newResult
    },
  },
}
</script>
```

## Props

- `document`：包含订阅的 GraphQL 文档，或一个接收 `gql` 标签作为参数并返回转换后的文档的函数。
- `variables`：将自动更新订阅变量的对象。
- `updateQuery`：可以根据需要更新查询结果的函数。
