# 查询

在 GraphQL 中，查询是发送给 API 以检索数据的请求。像这样使用 *GraphQL 文档* 来表示：

```graphql
query myHelloQueryName {
  hello
}
```

为每个你需要通过 Apollo 的查询结果提供数据的 Vue 属性，在 `apollo` 对象中添加一个对应属性。每一个属性都将创建一个智能查询。

## 简单查询

使用 `gql` 编写你的 GraphQL 查询：

```js
import gql from 'graphql-tag'
```

直接将 [gql](https://github.com/apollographql/graphql-tag) 查询作为值：

```js
apollo: {
  // 简单的查询，将更新 'hello' 这个 vue 属性
  hello: gql`{hello}`,
},
```

接下来你可以通过 `this.$apollo.queries.<name>` 访问这个查询。

你可以在 vue 组件的 `data` 钩子中初始化属性：

```js
data () {
  return {
    // 初始化你的 apollo 数据
    hello: '',
  },
},
```

在服务端添加相应的 schema 和解析器：

```js
export const schema = `
type Query {
  hello: String
}

schema {
  query: Query
}
`

export const resolvers = {
  Query: {
    hello (root, args, context) {
      return 'Hello world!'
    },
  },
}
```

更多信息请访问 [apollo 文档](https://www.apollographql.com/docs/apollo-server/)。

接下来你可以在 vue 组件中正常使用属性：

```vue
<template>
  <div class="apollo">
    <h3>Hello</h3>
    <p>
      {{hello}}
    </p>
  </div>
</template>
```

## 名称匹配

请注意，初学者常见的错误是使用与查询中的字段名不相同的数据名称，例如：

```js
apollo: {
  world: gql`query {
    hello
  }`
}
```

注意 `world` 与 `hello` 的不同之处：vue-apollo 不会去猜测你想要将哪些数据从查询结果中放入组件中。默认情况下，它只会尝试你在组件中使用的数据名称（即 `apollo` 对象中的键），在本例中为 `world`。如果名称不匹配，你可以使用 `update` 选项来告诉 vue-apollo 在结果中使用什么样的数据：

```js
apollo: {
  world: {
    query: gql`query {
      hello
    }`,
    update: data => data.hello
  }
}
```

你也可以直接在 GraphQL 文档中重命名该字段：

```js
apollo: {
  world: gql`query {
    world: hello
  }`
}
```

在本例中，我们将 `hello` 字段重命名为 `world`，以便 vue-apollo 来自动推断应该从结果中取回什么。

## 带参数的查询

你可以通过在对象中声明 `query` 和 `variables` 将变量（读取参数）添加到 `gql` 查询中：

```js
// Apollo 具体选项
apollo: {
  // 带参数的查询
  ping: {
    // gql 查询
    query: gql`query PingMessage($message: String!) {
      ping(message: $message)
    }`,
    // 静态参数
    variables: {
      message: 'Meow',
    },
  },
},
```

你可以在这个对象中使用 apollo 的 `watchQuery` 中的选项，比如：
 - `fetchPolicy`
 - `pollInterval`
 - ...

更多细节请查看 [apollo 文档](https://www.apollographql.com/docs/react/api/apollo-client.html#ApolloClient.watchQuery)。

例如，你可以像这样添加 `fetchPolicy` apollo 选项：

```js
apollo: {
  // 带参数的查询
  ping: {
    query: gql`query PingMessage($message: String!) {
      ping(message: $message)
    }`,
    variables: {
      message: 'Meow'
    },
    // 在这里加入其他选项
    fetchPolicy: 'cache-and-network',
  },
},
```

同样的，你可以在 vue 组件中初始化属性：

```js
data () {
  return {
    // 初始化你的 apollo 数据
    ping: '',
  }
},
```

在服务端添加相应的 schema 和解析器：

```js
export const schema = `
type Query {
  ping(message: String!): String
}

schema {
  query: Query
}
`

export const resolvers = {
  Query: {
    ping (root, { message }, context) {
      return `Answering ${message}`
    },
  },
}
```

然后在你的 vue 组件中使用它：

```vue
<template>
  <div class="apollo">
    <h3>Ping</h3>
    <p>
      {{ ping }}
    </p>
  </div>
</template>
```

## 加载状态

你可以通过 `$apollo.loading` 属性显示加载状态：

```vue
<div v-if="$apollo.loading">Loading...</div>
```

或者针对这个特定的 `ping` 查询：

```vue
<div v-if="$apollo.queries.ping.loading">Loading...</div>
```

## 用函数作为选项

你可以使用将在创建组件时被调用一次的函数，并且它必须返回选项对象：

```js
// Apollo 具体选项
apollo: {
  // 带参数的查询
  ping () {
    // 它将在创建组件时被调用一次
    // 必须返回选项对象
    return {
      // gql 查询
      query: gql`query PingMessage($message: String!) {
        ping(message: $message)
      }`,
      // 静态参数
      variables: {
        message: 'Meow',
      },
    }
  },
},
```

::: tip
同样适用于 [订阅](./subscriptions.md)。
:::

## 响应式查询定义

你可以使用函数定义 `query` 选项。这将自动更新 graphql 查询的定义：

```js
// 特定标签可以是随机标签或最后添加的标签
featuredTag: {
  query () {
    // 这里你可以用'this' 访问组件实例
    if (this.showTag === 'random') {
      return gql`{
        randomTag {
          id
          label
          type
        }
      }`
    } else if (this.showTag === 'last') {
      return gql`{
        lastTag {
          id
          label
          type
        }
      }`
    }
  },
  // 为 'featuredTag' 这个组件属性赋值
  update: data => data.randomTag || data.lastTag,
},
```

::: tip
同样适用于 [订阅](./subscriptions.md)。
:::

## 响应式参数

使用函数使 vue 属性能够响应式的提供给参数：

```js
// Apollo 具体选项
apollo: {
  // 带参数的查询
  ping: {
    query: gql`query PingMessage($message: String!) {
      ping(message: $message)
    }`,
    // 响应式参数
    variables () {
      // 在这里使用 vue 响应式属性
      return {
          message: this.pingInput,
      }
    },
  },
},
```

在每次参数更改时，将重新获取查询，例如：

```vue
<template>
  <div class="apollo">
    <h3>Ping</h3>
    <input v-model="pingInput" placeholder="Enter a message" />
    <p>
      {{ping}}
    </p>
  </div>
</template>
```

## 跳过查询

如果查询被跳过，它将被禁用且结果将不再被更新。你可以使用 `skip` 选项：

```js
// Apollo 具体选项
apollo: {
  tags: {
    // GraphQL 查询
    query: gql`query tagList ($type: String!) {
      tags(type: $type) {
        id
        label
      }
    }`,
    // 响应式变量
    variables () {
      return {
        type: this.type,
      }
    },
    // 禁用这个查询
    skip () {
      return this.skipQuery
    },
  },
},
```

在这里，当 `skipQuery` 组件属性改变时，`skip` 将被自动调用。

你也可以直接访问查询并设置 `skip` 属性：

```js
this.$apollo.queries.tags.skip = true
```

## 响应式查询示例

这里是一个使用轮询的响应式查询示例：

```js
// Apollo 具体选项
apollo: {
  // vue 实例上的 'tags' 数据属性
  tags: {
    query: gql`query tagList {
      tags {
        id,
        label
      }
    }`,
    pollInterval: 300, // 毫秒
  },
},
```

这里是服务端的定义：

```js
export const schema = `
type Tag {
  id: Int
  label: String
}

type Query {
  tags: [Tag]
}

schema {
  query: Query
}
`

// 假数据生成器
import casual from 'casual'

// 生成一些标签
var id = 0
var tags = []
for (let i = 0; i < 42; i++) {
  addTag(casual.word)
}

function addTag (label) {
  let t = {
    id: id++,
    label,
  }
  tags.push(t)
  return t
}

export const resolvers = {
  Query: {
    tags (root, args, context) {
      return tags
    },
  },
}
```

## 手动添加智能查询

你可以使用 `$apollo.addSmartQuery(key, options)` 方法手动添加智能查询：

```js
created () {
  this.$apollo.addSmartQuery('comments', {
    // 选项同上文
  })
}
```

::: tip
组件 `apollo` 选项中的每个查询入口都在内部调用此方法。
:::

## 高级选项

还有更多专用于 vue-apollo 的选项，请查看 [API 参考](../../api/smart-query.md)。
