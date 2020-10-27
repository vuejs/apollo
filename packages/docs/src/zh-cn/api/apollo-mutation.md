# ApolloMutation 组件

本组件让你可以在模板中发送变更。

使用 [props](#props) 配置组件，并使用默认的 [插槽](#slot-props) 与之交互。

示例：

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
    <p v-if="error">An error occurred: {{ error }}</p>
  </template>
</ApolloMutation>
```

## Props

### mutation

GraphQL 查询（由 `graphql-tag` 转换）或一个接收 `gql` 标签作为参数并返回转换后的查询的函数。

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
/>
```

### variables

GraphQL 变量对象。

```vue
<ApolloMutation
  :variables="{
    name
  }"
/>
```

### optimisticResponse

乐观 UI 是一种在收到服务器响应之前，就可以模拟变更的结果并更新 UI 的模式。收到服务器的响应后，乐观的结果就会被丢弃，并由实际结果代替。

乐观 UI 提供了一种简单的方法，极大的加快 UI 响应速度，同时确保数据到达时与实际响应保持一致。

详见 [乐观 UI](https://www.apollographql.com/docs/react/performance/optimistic-ui/)

```vue
<ApolloMutation
  :optimisticResponse="{
    __typename: 'Mutation',
    someWork: {
      __typename: 'SomeWorkPayload',
      success: true,
      timeSpent: 100
    }
  }"
/>
```

### update

当执行变更时，你将修改后端数据。如果该数据也存在于你的 [Apollo 客户端缓存](https://www.apollographql.com/docs/react/caching/cache-configuration/) 中，你可能需要更新缓存以反映变更的结果。

如果一个变更修改了多个实体，或者创建或删除了实体，Apollo 客户端缓存不会自动更新以反映变更的结果。你可以使用 `update` 函数来解决这个问题。

update 函数的目的是修改缓存的数据，以匹配变更对后端数据所做的修改。

详见 [变更后更新缓存](https://www.apollographql.com/docs/react/data/mutations/#updating-the-cache-after-a-mutation)

```vue
<template>
  <ApolloMutation
    :update="update"
  />
</template>

<script>
export default {
  methods: {
    update(cache, { data: { addTodo } }) {
      cache.modify({
        fields: {
          todos(existingTodos = []) {
            const newTodoRef = cache.writeFragment({
              data: addTodo,
              fragment: gql`
                fragment NewTodo on Todo {
                  id
                  type
                }
              `,
            })
            return [...existingTodos, newTodoRef]
          },
        },
      })
    },
  },
}
</script>
```

### refetchQueries

在某些情况下，仅使用 `dataIdFromObject` 还不足以正确更新应用的 UI。例如，如果要在不重新获取整个列表的情况下向对象列表中添加某些内容，或者无法为某些对象分配对象标识符，则 Apollo Client 无法为你更新现有的查询。继续阅读以了解你可以使用的其他工具。

`refetchQueries` 是更新缓存的最简单方法。使用 `refetchQueries`，你可以指定一个或多个要在变更完成后运行的查询，以重新获取存储中可能受到该变更影响的部分。

详见 [变更后重新获取查询](https://www.apollographql.com/docs/react/caching/advanced-topics/#updating-after-a-mutation)

```vue
<template>
  <ApolloMutation
    :refetchQueries="refetchQueriesAfterMyMutation"
  />
</template>

<script>
import { gql } from '@apollo/client/core'

export default {
  computed: {
    refetchQueriesAfterMyMutation () {
      return [{
        query: gql`
          query UpdateCache($repoName: String!) {
            entry(repoFullName: $repoName) {
              id
              comments {
                postedBy {
                  login
                  html_url
                }
                createdAt
                content
              }
            }
          }
        `,
        variables: { repoName: 'apollographql/apollo-client' },
      }]
    },
  },
}
</script>
```

### clientId

查询所使用的 Apollo 客户端 id（在 ApolloProvider 的 `clients` 选项中定义）、

```vue
<ApolloMutation
  clientId="myClient"
/>
```

### tag

字符串格式的 HTML 标签名（默认值：`div`）；如果是 `undefined`，该组件将成为无渲染组件（内容不会被包装在标签中）

```vue
<ApolloMutation
  tag="span"
/>
```

### context

向下传递 Apollo link 中的上下文对象。

详见 [apollo context](https://www.apollographql.com/docs/react/api/link/apollo-link-context/)

```vue
<ApolloMutation
  :context="{
    answer: 42,
  }"
/>
```

## 插槽 props

### mutate

签名：

```ts
mutate(options = null): Promise<FetchResult>
```

- `options`: [变更选项](https://www.apollographql.com/docs/react/api/core/ApolloClient/#ApolloClient.mutate).

用来调用变更的函数。你可以重载变更的选项（例如：`mutate({ variables: { foo: 'bar } })`）。

```vue
<ApolloMutation>
  <template v-slot="{ mutate }">
    <button @click="mutate({ variables: { myVar: 42 } })">Click me</button>
  </template>
</ApolloMutation>
```

### loading

布尔值，表明请求正在进行中。

```vue
<ApolloMutation>
  <template v-slot="{ loading }">
    <button :disabled="loading">Click me</button>
  </template>
</ApolloMutation>
```

### error

最后一次变更调用的最终错误。

```vue
<ApolloMutation>
  <template v-slot="{ error }">
    <p v-if="error">An error occurred: {{ error }}</p>
  </template>
</ApolloMutation>
```

### gqlError

第一个 GraphQL 错误（如果有）。

```vue
<ApolloMutation>
  <template v-slot="{ gqlError }">
    <p v-if="gqlError">An error occurred: {{ gqlError.message }}</p>
  </template>
</ApolloMutation>
```

## 事件

### done

收到变更结果时发出。

参数：

- `result`: FetchResult

```vue
<ApolloMutation
  @done="result => {}"
/>
```

### error

发生错误时发出。

参数：

- `error`: Error object

```vue
<ApolloMutation
  @error="error => {}"
/>
```

### loading

当加载状态改变时发出。

参数：

- `loading`: Boolean

```vue
<ApolloMutation
  @loading="loading => {}"
/>
```
