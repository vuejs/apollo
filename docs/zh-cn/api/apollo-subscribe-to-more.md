# ApolloSubscribeToMore 组件

## Props

- `document`：包含订阅的 GraphQL 文档，或一个接收 `gql` 标签作为参数并返回转换后的文档的函数。
- `variables`：将自动更新订阅变量的对象。
- `updateQuery`：可以根据需要更新查询结果的函数。
