# ApolloQuery

你可以使用 `ApolloQuery`（或 `apollo-query`）组件直接在模板中侦听 Apollo 查询。

阅读完本页后，在 [API 参考](../../api/apollo-query.md) 查看所有可用的选项。

## 使用 gql 标签的查询

这是使用 `ApolloQuery` 组件的推荐方法。它与 `gql` 标签使用相同的语法，就像在其他示例中一样：

```vue
<template>
  <ApolloQuery
    :query="gql => gql`
      query MyHelloQuery ($name: String!) {
        hello (name: $name)
      }
    `"
    :variables="{ name }"
  >
    <!-- TODO -->
  </ApolloQuery>
</template>
```

我们将一个函数传递给 `query` 属性，它将 `gql` 标签作为参数，因此我们可以直接编写 GraphQL 文档。

上面的例子中还包含将 `variables` 通过其同名属性传递给查询的功能。

在 `ApolloQuery` 的默认插槽中，你可以访问有关被侦听查询的各种插槽数据，比如 `result` 对象：

```vue
<template v-slot="{ result: { loading, error, data } }">
  <!-- Loading -->
  <div v-if="loading" class="loading apollo">Loading...</div>

  <!-- Error -->
  <div v-else-if="error" class="error apollo">An error occured</div>

  <!-- Result -->
  <div v-else-if="data" class="result apollo">{{ data.hello }}</div>

  <!-- No result -->
  <div v-else class="no-result apollo">No result :(</div>
</template>
```

这是一个完整的示例组件：

```vue
<script>
export default {
  data () {
    return {
      name: 'Anne'
    }
  }
}
</script>

<template>
  <div>
    <input v-model="name" placeholder="Enter your name">

    <ApolloQuery
      :query="gql => gql`
        query MyHelloQuery ($name: String!) {
          hello (name: $name)
        }
      `"
      :variables="{ name }"
    >
      <template v-slot="{ result: { loading, error, data } }">
        <!-- Loading -->
        <div v-if="loading" class="loading apollo">Loading...</div>

        <!-- Error -->
        <div v-else-if="error" class="error apollo">An error occured</div>

        <!-- Result -->
        <div v-else-if="data" class="result apollo">{{ data.hello }}</div>

        <!-- No result -->
        <div v-else class="no-result apollo">No result :(</div>
      </template>
    </ApolloQuery>
  </div>
</template>
```

### 配置标签

如果你没有使用 [vue-cli-plugin-apollo](https://github.com/Akryum/vue-cli-plugin-apollo) (`v0.20.0+`)，则需要配置 [vue-loader](https://vue-loader.vuejs.org) 来转换字符串模板标签。`vue-loader` 在底层使用 [Bublé](https://buble.surge.sh/guide/) 来转换组件模板中的代码。我们需要将 `dangerousTaggedTemplateString` 变换添加到 Bublé 以使 `gql` 起作用。例如，在使用 Vue CLI 时：

```js
// vue.config.js

module.exports = {
  chainWebpack: config => {
    config.module
      .rule('vue')
      .use('vue-loader')
        .loader('vue-loader')
        .tap(options => {
          options.transpileOptions = {
            transforms: {
              dangerousTaggedTemplateString: true,
            },
          }
          return options
        })
  }
}
```

在原始的 Webpack 配置中，它将如下所示：

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: [
          {
            loader: 'vue-loader',
            options: {
              transpileOptions: {
                transforms: {
                  dangerousTaggedTemplateString: true
                }
              }
            }
          }
        ]
      },

      /* 其他规则 ... */
    ]
  }
}
```

## 使用 gql 文件的查询

使用本组件的另一种方法是创建单独的 `.gql` 文件。这些文件需要使用 [graphql-tag](https://github.com/apollographql/graphql-tag#webpack-preprocessing-with-graphql-tagloader) 进行预处理。

```vue
<template>
  <ApolloQuery
    :query="require('../graphql/HelloWorld.gql')"
    :variables="{ name }"
  >
    <template v-slot="{ result: { loading, error, data } }">
      <!-- Loading -->
      <div v-if="loading" class="loading apollo">Loading...</div>

      <!-- Error -->
      <div v-else-if="error" class="error apollo">An error occured</div>

      <!-- Result -->
      <div v-else-if="data" class="result apollo">{{ data.hello }}</div>

      <!-- No result -->
      <div v-else class="no-result apollo">No result :(</div>
    </template>
  </ApolloQuery>
</template>
```

## 查询操作

你可以使用 `query` 插槽属性来访问智能查询对象。下面是使用 `fetchMore` 分页数据的示例组件：

```vue
<template>
  <ApolloQuery
    :query="/* query */"
    :variables="{
      limit: $options.pageSize
    }"
    v-slot="{ result: { loading, error, data }, query }"
  >
    <!-- 在这里显示数据 -->
    <button v-if="hasMore" @click="loadMore(query)">Load more</button>
  </ApolloQuery>
</template>

<script>
export default {
  pageSize: 10,

  data: {
    return {
      page: 1,
      hasMore: true
    }
  },

  methods: {
    async loadMore (query) {
      await query.fetchMore({
        variables: {
          offset: this.page++ * this.$options.pageSize
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult || fetchMoreResult.product.length === 0) {
            this.hasMore = false
            return prev
          }
          return Object.assign({}, prev, {
            product: [...prev.product, ...fetchMoreResult.product]
          })
        }
      })
    }
  }
}
</script>
```

在 [API 参考](../../api/smart-query.md#methods) 查看所有可用的智能查询方法。

## 使用片段

片段可用于在其他文档中共享部分 GraphQL 文档，以便一致地检索相同的数据，且无需复制粘贴代码。

假设我们有一个`GetMessages` 查询，带有一个类型是 `Message` 对象数组的 `messages` 字段：

```gql
query GetMessages {
  messages {
    id
    user {
      id
      name
    }
    text
    created
  }
}
```

我们想要将 `messages` 中 `Message` 类型的所有字段提取到一个片段中，以使我们可以在其他地方重复使用它。

首先将 `gql` 标签导入组件：

```js
import gql from 'graphql-tag'
```

然后，在组件定义中，声明一个新的 `fragments` 对象：

```js
export default {
  fragments: {
    /** TODO */
  }
}
```

以下是应用于 `Message` 类型的 `message` 片段，如下所示：

```gql
fragment message on Message {
  id
  user {
    id
    name
  }
  text
  created
}
```

我们可以像查询一样使用 `gql` 标签：

```js
export default {
  fragments: {
    message: gql`
      fragment message on Message {
        id
        user {
          id
          name
        }
        text
        created
      }
    `
  }
}
```

我们现在可以在组件中使用 `this.$options.fragments.message` 访问该片段。要在我们的 `GetMessages` 查询中使用此片段，我们需要使用 GraphQL 的 `...` 展开运算符，并将片段放在查询旁边：

```js
gql`
  query GetMessages {
    messages {
      ...message
    }
  }
  ${$options.fragments.message}
`
```

这将有效地生成 GraphQL 文档（你可以在你的 GraphQL API playground 上尝试）：

```gql
query GetMessages {
  messages {
    ...message
  }
}
fragment message on Message {
  id
  user {
    id
    name
  }
  text
  created
}
```

那么这里发生了什么？GraphQL 将找到 `...` 运算符，表明我们将在查询的 `messages` 字段中选择字段。`...` 运算符之后是片段名称 `message`，然后在整个 GraphQL 文档中查找片段。由于我们已经正确定义了片段，因此它能够在查询下面被找到。最后，GraphQL 将复制所有片段内容并用它替换 `...message`。

最后，我们获得最终查询：

```gql
query GetMessages {
  messages {
    id
    user {
      id
      name
    }
    text
    created
  }
}
fragment message on Message {
  id
  user {
    id
    name
  }
  text
  created
}
```

这是一个完整的示例组件：

```vue
<!-- MessageList.vue -->
<script>
import gql from 'graphql-tag'

export default {
  fragments: {
    message: gql`
      fragment message on Message {
        id
        user {
          id
          name
        }
        text
        created
      }
    `
  }
}
</script>

<template>
  <ApolloQuery
    :query="gql => gql`
      query GetMessages {
        messages {
          ...message
        }
      }
      ${$options.fragments.message}
    `"
  >
    <!-- 内容... -->
  </ApolloQuery>
</template>
```

### 重复使用片段

现在我们可以在另一个组件中检索 `message` 片段：

```vue
<!-- MessageForm.vue -->
<script>
import gql from 'graphql-tag'
import MessageList from './MessageList.vue'

export default {
  methods: {
    async sendMessage () {
      await this.$apollo.mutate({
        mutation: gql`
          mutation SendMessage ($input: SendMessageInput!) {
            addMessage (input: $input) {
              newMessage {
                ...message
              }
            }
          }
          ${MessageList.fragments.message}
        `,
        variables: {
          /* 这里是变量 */
        },
        /* 这里是其他选项 */
      })
    }
  }
}
</script>
```
