# 订阅

## 设置

*关于服务端实现，你可以看看 [这个简单的示例](https://github.com/Akryum/apollo-server-example)。*

```js
import { ApolloClient, HttpLink, InMemoryCache, split } from '@apollo/client/core'
import { WebSocketLink } from '@apollo/client/link/ws'
import { getMainDefinition } from '@apollo/client/utilities'

const httpLink = new HttpLink({
  // 你需要在这里使用绝对路径
  uri: 'http://localhost:3020/graphql',
})

// 创建订阅的 websocket 连接
const wsLink = new WebSocketLink({
  uri: 'ws://localhost:3000/subscriptions',
  options: {
    reconnect: true,
  },
})

// 使用分割连接的功能
// 你可以根据发送的操作类型将数据发送到不同的连接
const link = split(
  // 根据操作类型分割
  ({ query }) => {
    const definition = getMainDefinition(query)
    return definition.kind === 'OperationDefinition'
      && definition.operation === 'subscription'
  },
  wsLink,
  httpLink
)

// 创建 apollo 客户端
const apolloClient = new ApolloClient({
  link,
  cache: new InMemoryCache(),
  connectToDevTools: true,
})
```

## 订阅更多

如果你需要更新一个来自订阅的智能查询结果，最好的方式是使用 `subscribeToMore` 查询方法。它将创建链接到智能查询的 [智能订阅](../api/smart-subscription.md)。你只需要将 `subscribeToMore` 添加到智能查询中：

```js
export default {
  apollo: {
    tags: {
      query: TAGS_QUERY,
      subscribeToMore: {
        document: gql`subscription name($param: String!) {
        itemAdded(param: $param) {
          id
          label
        }
      }`,
        // 传递给订阅的变量
        // 由于我们使用了函数，因此它们是响应式的
        variables() {
          return {
            param: this.param,
          }
        },
        // 变更之前的结果
        updateQuery: (previousResult, { subscriptionData }) => {
        // 在这里用之前的结果和新数据组合成新的结果
        },
      }
    }
  }
}
```

::: tip
注意，你可以将一组订阅传递给 `subscribeToMore` 以将此查询关联到多个订阅。
:::

### Alternate usage

你可以使用 `this.$apollo.queries.<name>` 访问你在 `apollo` 选项中定义的查询，所以它看起来像这样：

```js
this.$apollo.queries.tags.subscribeToMore({
  // GraphQL 文档
  document: gql`subscription name($param: String!) {
    itemAdded(param: $param) {
      id
      label
    }
  }`,
  // 传递给订阅的变量
  variables: {
    param: '42',
  },
  // 变更之前的结果
  updateQuery: (previousResult, { subscriptionData }) => {
    // 在这里用之前的结果和新数据组合成新的结果
  },
})
```

如果相关查询停止，订阅将自动销毁。

这里是一个示例：

```js
// 订阅的 GraphQL 文档
const TAG_ADDED = gql`subscription tags($type: String!) {
  tagAdded(type: $type) {
    id
    label
    type
  }
}`

// SubscribeToMore 标签
// 我们有不同类型的标签
// 每种类型都有一个订阅 '频道'
this.$watch(() => this.type, (type, oldType) => {
  if (type !== oldType || !this.tagsSub) {
    // 我们需要在重新订阅之前取消订阅
    if (this.tagsSub) {
      this.tagsSub.unsubscribe()
    }
    // 在查询上订阅
    this.tagsSub = this.$apollo.queries.tags.subscribeToMore({
      document: TAG_ADDED,
      variables: {
        type,
      },
      // 变更之前的结果
      updateQuery: (previousResult, { subscriptionData }) => {
        // 如果我们在没有做操作的情况下已经添加了标签
        // 这可能是由 addTag 变更上的 `updateQuery` 导致
        if (previousResult.tags.find(tag => tag.id === subscriptionData.data.tagAdded.id)) {
          return previousResult
        }

        return {
          tags: [
            ...previousResult.tags,
            // 添加新的标签
            subscriptionData.data.tagAdded,
          ],
        }
      },
    })
  }
}, {
  immediate: true,
})
```

## 简单订阅

::: danger
如果要使用订阅的结果更新查询，请使用 `subscribeToMore`。
以下的方法适用于 'notify' 用例。
:::

你可以在 `apollo` 选项中使用 `$subscribe` 关键字来声明 [智能订阅](../api/smart-subscription.md)：

```js
export default {
  apollo: {
  // 订阅
    $subscribe: {
    // 当添加一个标签时
      tagAdded: {
        query: gql`subscription tags($type: String!) {
        tagAdded(type: $type) {
          id
          label
          type
        }
      }`,
        // 响应式变量
        variables() {
        // 像常规查询一样运作
        // 在每次改变值时都会使用正确的变量重新订阅
          return {
            type: this.type,
          }
        },
        // 结果钩子
        // 不要忘记对 `data` 进行解构
        result({ data }) {
          console.log(data.tagAdded)
        },
      },
    },
  },
}
```

你可以使用 `this.$apollo.subscriptions.<name>` 访问这个订阅。

:::tip
和查询一样，你可以 [使用函数](./queries.md#用函数作为选项) 声明订阅，并且可以 [使用响应式函数](./queries.md#响应式查询定义) 声明 `query` 选项。
:::

当服务端支持实时查询并使用订阅更新它们时，例如 [Hasura](https://hasura.io/)，你可以使用简单订阅来实现响应式查询：

```js
export default {
  data() {
    return {
      tags: [],
    }
  },
  apollo: {
    $subscribe: {
      tags: {
        query: gql`subscription {
        tags {
          id
          label
          type
        }
      }`,
        result({ data }) {
          this.tags = data.tags
        },
      },
    },
  },
}
```

## 跳过订阅

如果订阅被跳过，它将被禁用且不再被更新。你可以使用 `skip` 选项：

```js
export default {
// Apollo 具体选项
  apollo: {
  // 订阅
    $subscribe: {
    // 当添加一个标签时
      tags: {
        query: gql`subscription tags($type: String!) {
        tagAdded(type: $type) {
          id
          label
          type
        }
      }`,
        // 响应式变量
        variables() {
          return {
            type: this.type,
          }
        },
        // 结果钩子
        result(data) {
        // 更新本地数据
          this.tags.push(data.tagAdded)
        },
        // 跳过这个订阅
        skip() {
          return this.skipSubscription
        }
      },
    },
  },
}
```

在这里，当 `skipSubscription` 组件属性改变时，`skip` 将被自动调用。

你也可以直接访问订阅并设置 `skip` 属性：

```js
this.$apollo.subscriptions.tags.skip = true
```

## 手动添加智能订阅

你可以使用 `$apollo.addSmartSubscription(key, options)` 方法手动添加智能订阅：

```js
export default {
  created() {
    this.$apollo.addSmartSubscription('tagAdded', {
    // 选项同 '$subscribe'
    })
  }
}
```

:::tip
组件 `apollo` 选项中的每个 `$subscribe` 对象入口都在内部调用此方法。
:::

## 标准 Apollo 订阅

使用 `$apollo.subscribe()` 方法来创建一个 GraphQL 订阅，当组件被销毁时将自动终止。它**不会**创建智能订阅。

```js
export default {
  mounted() {
    const subQuery = gql`subscription tags($type: String!) {
    tagAdded(type: $type) {
      id
      label
      type
    }
  }`

    const observer = this.$apollo.subscribe({
      query: subQuery,
      variables: {
        type: 'City',
      },
    })

    observer.subscribe({
      next(data) {
        console.log(data)
      },
      error(error) {
        console.error(error)
      },
    })
  },
}
```
