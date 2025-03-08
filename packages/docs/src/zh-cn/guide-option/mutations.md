# 变更

变更是在你的 apollo 服务端更改你的数据状态的查询。

使用 `this.$apollo.mutate()` 来发送一个 GraphQL 变更。

想要了解更多信息，请访问 [apollo 文档](https://www.apollographql.com/docs/react/api/core/ApolloClient.html#ApolloClient.mutate)。有一个以变更为重点的 [示例应用](https://github.com/Akryum/vue-apollo-todos)，你可以看看。

::: warning
你不应当在 variables 中发送 `__typename` 字段，因此不建议直接发送 Apollo 结果对象。
:::

```js
export default {
  methods: {
    addTag() {
    // 保存用户输入以防止错误
      const newTag = this.newTag
      // 将其清除以尽早更新用户页面
      this.newTag = ''
      // 调用 graphql 变更
      this.$apollo.mutate({
      // 查询语句
        mutation: gql`mutation ($label: String!) {
        addTag(label: $label) {
          id
          label
        }
      }`,
        // 参数
        variables: {
          label: newTag,
        },
        // 用结果更新缓存
        // 查询将先通过乐观响应、然后再通过真正的变更结果更新
        update: (store, { data: { addTag } }) => {
        // 从缓存中读取这个查询的数据
          const data = store.readQuery({ query: TAGS_QUERY })
          // 将变更中的标签添加到最后
          data.tags.push(addTag)
          // 将数据写回缓存
          store.writeQuery({ query: TAGS_QUERY, data })
        },
        // 乐观 UI
        // 将在请求产生时作为“假”结果，使用户界面能够快速更新
        optimisticResponse: {
          __typename: 'Mutation',
          addTag: {
            __typename: 'Tag',
            id: -1,
            label: newTag,
          },
        },
      }).then((data) => {
      // 结果
        console.log(data)
      }).catch((error) => {
      // 错误
        console.error(error)
        // 恢复初始用户输入
        this.newTag = newTag
      })
    },
  },
}
```

## 服务端示例

```js
// 假数据生成器
import faker from 'faker'

export const schema = `
type Tag {
  id: Int
  label: String
}

type Query {
  tags: [Tag]
}

type Mutation {
  addTag(label: String!): Tag
}

schema {
  query: Query
  mutation: Mutation
}
`

// 生成一些标签
let id = 0
const tags = []
for (let i = 0; i < 42; i++) {
  addTag(faker.random.word())
}

function addTag(label) {
  const t = {
    id: id++,
    label,
  }
  tags.push(t)
  return t
}

export const resolvers = {
  Query: {
    tags(root, args, context) {
      return tags
    },
  },
  Mutation: {
    addTag(root, { label }, context) {
      console.log(`adding tag '${label}'`)
      return addTag(label)
    },
  },
}
```
