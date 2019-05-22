# ApolloMutation

你可以使用 `ApolloMutation`（或 `apollo-mutation`）组件直接在模板中调用 Apollo 变更。

这是一个简单的例子：

```vue
<ApolloMutation
  :mutation="gql => gql`
    mutation DoStuff ($name: String!) {
      someWork (name: $name) {
        success
        timeSpent
      }
    }
  `"
  :variables="{
    name
  }"
  @done="onDone"
>
  <template v-slot="{ mutate, loading, error }">
    <button :disabled="loading" @click="mutate()">Click me</button>
    <p v-if="error">An error occured: {{ error }}</p>
  </template>
</ApolloMutation>
```

在 [ApolloQuery](./query.md) 查看如何在模板中编写 GraphQL 查询。

在 [API 参考](../../api/apollo-mutation.md) 查看所有可用的选项。

## 更新缓存

如果变更只更新缓存中已有的对象（例如编辑现有字段），则你不需要进行任何操作，因为 Apollo Client 将自动更新缓存，但仅当变更结果中的对象包含 `__typename` 和 `id` 字段（或用于 [规范化缓存](https://www.apollographql.com/docs/react/advanced/caching#normalization) 的自定义字段）时适用。

否则，你需要告知 Apollo Client 如何使用变更结果来更新缓存。例如，如果变更添加了新项目，则必须更新相关查询结果以有效地将此新项目推送到查询中。

### 添加项目

```vue
<template>
  <ApolloMutation
    :mutation="gql => gql`
      mutation ($input: SendMessageToThreadInput!) {
        sendMessageToThread (input: $input) {
          message {
            ...message
          }
        }
      }
      ${$options.fragments.message}
    `"
    :variables="{
      threadId,
      text
    }"
    :update="updateCache"
  >
    <!-- 这里是表单 -->
  </ApolloMutation>
</template>

<script>
import gql from 'gql-tag'

const fragments = {
  message: gql`
    fragment message on Message {
      id
      text
      user {
        id
        name
      }
    }
  `
}

export default {
  fragments,

  props: {
    threadId: {
      type: String,
      required: true
    }
  },

  methods: {
    updateCache (store, { data: { sendMessageToThread } }) {
      const query = {
        query: gql`
        query ($threadId: ID!) {
          thread (id: $threadId) {
            id
            messages {
              ...message
            }
          }
        }
        ${fragments.message}
        `,
        variables: {
          threadId: this.threadId,
        },
      }
      // 读取缓存中的查询
      const data = store.readQuery(query)
      // 变更缓存结果
      data.thread.messages.push(sendMessageToThread.message)
      // 将结果写回缓存
      store.writeQuery({
        ...query,
        data,
      })
    },
  }
}
</script>
```

### 移除项目

```vue
<template>
  <ApolloMutation
    :mutation="gql => gql`
      mutation ($input: DeleteMessageFromThreadInput!) {
        deleteMessageFromThread (input: $input) {
          success
        }
      }
    `"
    :variables="{
      threadId,
      messageId
    }"
    :update="updateCache"
  >
    <!-- 这里是表单 -->
  </ApolloMutation>
</template>

<script>
import gql from 'gql-tag'

const fragments = {
  message: gql`
    fragment message on Message {
      id
      text
      user {
        id
        name
      }
    }
  `
}

export default {
  fragments,

  props: {
    threadId: {
      type: String,
      required: true
    },
    messageId: {
      type: String,
      required: true
    }
  },

  methods: {
    updateCache (store, { data: { deleteMessageFromThread } }) {
      const query = {
        query: gql`
        query ($threadId: ID!) {
          thread (id: $threadId) {
            id
            messages {
              ...message
            }
          }
        }
        ${fragments.message}
        `,
        variables: {
          threadId: this.threadId,
        },
      }
      // 读取缓存中的查询
      const data = store.readQuery(query)
      // 查找需要删除的项目
      const index = data.thread.messages.findIndex(m => m.id === this.messageId)
      if (index !== -1) {
        // 变更缓存结果
        data.thread.messages.splice(index, 1)
        // 将结果写回缓存
        store.writeQuery({
          ...query,
          data,
        })
      }
    },
  }
}
</script>
```
