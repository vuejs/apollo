# 本地状态

## 为什么要使用 Apollo 的本地状态管理？

当你使用 Apollo 执行 GraphQL 查询时，API 调用的结果将存储在 **Apollo 缓存**中。现在想象一下，你还需要存储一些本地应用状态并使之可用于不同的组件。通常，在 Vue 应用中我们可以使用 [Vuex](https://vuex.vuejs.org/) 来实现这一需求。但同时使用 Apollo 和 Vuex 意味着你将数据存储到了两个不同的位置，导致你拥有**两个数据源**。

好在 Apollo 具有将本地应用数据存储到缓存的机制。以前，它使用了 [apollo-link-state](https://github.com/apollographql/apollo-link-state) 库来实现。在 Apollo 2.5 发布后这个功能被包含在 Apollo 核心中。

## 创建一个本地 schema

如同创建 GraphQL schema 是在服务端定义数据模型的第一步一样，编写本地 schema 是我们在客户端进行的第一步。

让我们创建一个本地 schema 来描述将在 todo 列表中作为单个事项的元素。在这个事项中应该有一些文本、一些定义它是否已经完成的属性、以及一个 ID 来区分不同的待办事项。所以，它应该是一个具有三个属性的对象：

```js
{
  id: 'uniqueId',
  text: 'some text',
  done: false
}
```

现在我们可以将 `Item` 类型添加到本地 GraphQL schema 中。

```js
//main.js

import gql from 'graphql-tag';

export const typeDefs = gql`
  type Item {
    id: ID!
    text: String!
    done: Boolean!
  }
`;
```

这里的 `gql` 代表解析 GraphQL 查询字符串的 JavaScript 模板字符串标签。

现在我们需要将 `typeDefs` 添加到我们的 Apollo 客户端。

```js{4-5}
// main.js

const apolloClient = new ApolloClient({
  typeDefs,
  resolvers: {},
});
```

:::warning WARNING
正如你所见，我们在此处添加了一个空的 `resolvers` 对象：如果我们不将它添加到 Apollo 客户端的选项，它将无法识别对本地状态的查询，并将尝试向远程 URL 发送请求。
:::

## 在本地扩展一个远程 GraphQL schema

除了从零开始创建本地 schema 之外，你还可以将本地的**虚拟字段**添加到现有的远程 schema 中。这些字段仅存在于客户端上，可用于使用本地状态装饰服务端数据。

想象我们的远程 schema 中有一个 `User` 类型：

```js
type User {
  name: String!
  age: Int!
}
```

而我们想要给 `User` 添加一个只在本地拥有的属性：

```js
export const schema = gql`
  extend type User {
    twitter: String
  }
`;
```

现在，在查询用户时，我们需要指定 `twitter` 是本地字段：

```js
const userQuery = gql`
  user {
    name
    age
    twitter @client
  }
`;
```

## 初始化 Apollo 缓存

要在应用中初始化 Apollo 缓存，需要使用 `InMemoryCache` 构造函数。首先，将它导入你的主文件：

```js{4,6}
// main.js

import ApolloClient from 'apollo-boost';
import { InMemoryCache } from 'apollo-cache-inmemory';

const cache = new InMemoryCache();
```

现在我们需要在 Apollo 客户端选项中添加缓存：

```js{4}
//main.js

const apolloClient = new ApolloClient({
  cache,
  typeDefs,
  resolvers: {},
});
```

现在缓存是空的。要向缓存添加一些初始数据，我们需要使用 `writeData` 方法：

```js{9-20}
// main.js

const apolloClient = new ApolloClient({
  cache,
  typeDefs,
  resolvers: {},
});

cache.writeData({
  data: {
    todoItems: [
      {
        __typename: 'Item',
        id: 'dqdBHJGgjgjg',
        text: 'test',
        done: true,
      },
    ],
  },
});
```

我们刚刚为缓存数据添加了一个 `todoItems` 数组，并定义了其中每项的类型名称为 `Item`（在我们的本地 schema 中指定）。

## 查询本地数据

查询本地缓存与 [将 GraphQL 查询发送到远程服务器](../guide-option/queries.md) 非常相似。首先，我们需要创建一个查询：

```js
// App.vue

import gql from 'graphql-tag';

const todoItemsQuery = gql`
  {
    todoItems @client {
      id
      text
      done
    }
  }
`;
```

`@client` 指令是与发送到远程 API 的查询的主要区别。该指令指定 Apollo 客户端不应在远程 GraqhQL API 上执行此查询，而是应该从本地缓存中获取结果。

现在，我们可以在 Vue 组件中像普通的 Apollo 查询一样使用此查询：

```js
// App.vue

apollo: {
  todoItems: {
    query: todoItemsQuery
  }
},
```

## 使用变更修改本地数据

我们有两种不同的方法来修改本地数据：

- 使用 `writeData` 方法直接写入，就像我们在 [缓存初始化](#初始化-apollo-缓存) 时所做的那样；
- 调用一个 GraphQL 变更。

让我们在 [本地 GraphQL schema](#创建一个本地-schema) 中添加一些变更：

```js{10-14}
// main.js

export const typeDefs = gql`
  type Item {
    id: ID!
    text: String!
    done: Boolean!
  }

  type Mutation {
    checkItem(id: ID!): Boolean
    addItem(text: String!): Item
  }
`;
```

`checkItem` 变更会将某一事项的 `done` 属性设置为相反的布尔值。让我们用 `gql` 创建它：

```js
// App.vue

const checkItemMutation = gql`
  mutation($id: ID!) {
    checkItem(id: $id) @client
  }
`;
```

我们定义了一个**本地**变更（因为在这里写了一个 `@client` 指令），它将接受一个唯一的标识符作为参数。现在，我们需要一个**解析器**：一个解析 schema 中类型或字段的值的函数。

在我们的例子中，解析器将定义当我们执行了变更时会对本地 Apollo 缓存做出哪些更改。本地解析器具有与远程解析器相同的功能签名（`(parent, args, context, info) => data`）。事实上，我们只需要使用 args（传递给变更的参数）和 context（我们需要它的缓存属性来读写数据）。

让我们在主文件中添加一个解析器：

```js
// main.js

const resolvers = {
  Mutation: {
    checkItem: (_, { id }, { cache }) => {
      const data = cache.readQuery({ query: todoItemsQuery });
      const currentItem = data.todoItems.find(item => item.id === id);
      currentItem.done = !currentItem.done;
      cache.writeQuery({ query: todoItemsQuery, data });
      return currentItem.done;
    },
};
```

在这里我们做了什么？

1. 从缓存中读取 `todoItemsQuery` 以查看我们现在拥有的 `todoItems`；
2. 查找具有给定 id 的事项；
3. 将找到的事项的 `done` 属性改为相反的值；
4. 将我们更改的 `todoItems` 写回缓存；
5. 将 `done` 属性作为变更的结果返回。

现在我们需要用新创建的 `resolvers` 替换 Apollo 客户端选项中的空 `resolvers` 对象：

```js{17}
// main.js

const resolvers = {
  Mutation: {
    checkItem: (_, { id }, { cache }) => {
      const data = cache.readQuery({ query: todoItemsQuery });
      const currentItem = data.todoItems.find(item => item.id === id);
      currentItem.done = !currentItem.done;
      cache.writeQuery({ query: todoItemsQuery, data });
      return currentItem.done;
    },
};

const apolloClient = new ApolloClient({
  cache,
  typeDefs,
  resolvers,
});
```

现在，我们可以在 Vue 组件中像普通的 Apollo [变更](../guide-option/mutations.md) 一样使用此变更：

```js
// App.vue

methods: {
  checkItem(id) {
    this.$apollo.mutate({
      mutation: checkItemMutation,
      variables: { id }
    });
  },
}
```
