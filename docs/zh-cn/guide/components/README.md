# 什么是 Apollo 组件？

这些组件就像其他组件一样。它们在 prop 中使用 GraphQL 文档，并使用 [作用域插槽功能](https://vuejs.org/v2/guide/components-slots.html#Scoped-Slots) 来传递结果。

这样做的好处是你可以直接在模板中使用这些组件，而不是使用组件的 `apollo` 选项。在某些情况下，你甚至不需要在 `.vue` 中添加脚本部分！这种代码会更加声明式。

这是一个简单的例子：

```vue
<template>
  <div class="users-list">
    <!-- Apollo 查询 -->
    <ApolloQuery :query="require('@/graphql/users.gql')">
      <!-- 结果将自动更新 -->
      <template slot-scope="{ result: { data, loading } }">
        <!-- 一些内容 -->
        <div v-if="loading">Loading...</div>
        <ul v-else>
          <li v-for="user of data.users" class="user">
            {{ user.name }}
          </li>
        </ul>
      </template>
    </ApolloQuery>
  </div>
</template>

<!-- 不需要脚本 -->

<style scoped>
.user {
  list-style: none;
  padding: 12px;
  color: blue;
}
</style>
```
