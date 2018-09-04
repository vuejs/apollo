# 使用 `fetchMore` 实现分页

*[这里](https://github.com/Akryum/apollo-server-example/blob/master/schema.js#L21) 是服务端的一个简单示例。*

有时候你的数据集非常大，你想分块加载它。

使用智能查询上的 `fetchMore()` 方法来加载更多数据。

::: warning
不要忘记将 `__typename` 包含到新结果中。

使用 `variables()` 时不要更改返回的初始变量，否则列表数据将丢失。
:::

示例：

```vue
<template>
  <div id="app">
    <h2>Pagination</h2>
    <div class="tag-list" v-if="tagsPage">
      <div class="tag-list-item" v-for="tag in tagsPage.tags">
        {{ tag.id }} - {{ tag.label }} - {{ tag.type }}
      </div>
      <div class="actions">
        <button v-if="showMoreEnabled" @click="showMore">Show more</button>
      </div>
    </div>
  </div>
</template>

<script>
import gql from 'graphql-tag'

const pageSize = 10

export default {
  name: 'app',
  data: () => ({
    page: 0,
    showMoreEnabled: true,
  }),
  apollo: {
    // Pages
    tagsPage: {
      // GraphQL 查询
      query: gql`query tagsPage ($page: Int!, $pageSize: Int!) {
        tagsPage(page: $page, size: $pageSize) {
          tags {
            id
            label
            type
          }
          hasMore
        }
      }`,
      // 初始变量
      variables: {
        page: 0,
        pageSize,
      },
    },
  },
  methods: {
    showMore() {
      this.page ++
      // 获取更多数据并转换原始结果
      this.$apollo.queries.tagsPage.fetchMore({
        // 新的变量
        variables: {
          page: this.page,
          pageSize,
        },
        // 用新数据转换之前的结果
        updateQuery: (previousResult, { fetchMoreResult }) => {
          const newTags = fetchMoreResult.tagsPage.tags
          const hasMore = fetchMoreResult.tagsPage.hasMore

          this.showMoreEnabled = hasMore

          return {
            tagsPage: {
              __typename: previousResult.tagsPage.__typename,
              // 合并标签列表
              tags: [...previousResult.tagsPage.tags, ...newTags],
              hasMore,
            },
          }
        },
      })
    },
  },
}
</script>
```
