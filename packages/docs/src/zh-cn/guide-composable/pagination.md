# 分页

通常情况下，你需要在应用的某些视图中显示一个列表，该列表包含太多数据以至于无法一次性获取或显示。分页是解决此问题的最常见方法，并且 Apollo Client 的内置功能使其非常容易实现。

获取分页数据的方式基本上有两种：页码和游标。显示分页数据的方式也有两种：离散页面和无限滚动。要深入了解两者之间的区别以及何时使用其中的哪一个，我们建议你阅读 Apollo 关于该主题的博客文章：[了解分页](https://medium.com/apollo-stack/understanding-pagination-rest-graphql-and-relay-b10f835549e7)。

在本文中，我们将介绍使用 Apollo 来实现这两种方法的技术细节。

## 使用 `fetchMore`

在 Apollo 中，最简单的分页方法是使用由 `useQuery` 组合函数返回的 `fetchMore` 函数。这基本上可以使你执行新的 GraphQL 查询并将结果合并到原始结果中。

```js
const { fetchMore } = useQuery(...)
```

你可以指定要用于新查询的查询和变量，以及如何将新查询结果与客户端上的现有数据合并。具体的操作将决定你要实现什么样的分页。

## 基于偏移

基于偏移的分页（也称为页码分页）是一种很常见的模式，在许多网站上都可以找到，因为它通常是最容易在后端实现的。例如在 SQL 中，可以使用 [OFFSET 和 LIMIT](https://www.postgresql.org/docs/8.2/static/queries-limit.html) 轻松生成页码分页。

让我们用这个示例查询来加载一个可能包含无限数量帖子的订阅源：

```vue
<script>
import { useQuery } from '@vue/apollo-composable'
import gql from 'graphql-tag'

const FEED_QUERY = gql`
  query getFeed ($type: FeedType!, $offset: Int, $limit: Int) {
    currentUser {
      login
    }
    feed (type: $type, offset: $offset, limit: $limit) {
      id
      # ...
    }
  }
`

export default {
  props: ['type'],

  setup (props) {
    const { result } = useQuery(FEED_QUERY, () => ({
      type: props.type,
    }))

    return {
      result,
    }
  },
}
</script>
```

我们可以使用 `useQuery` 返回的 `fetchMore` 函数从订阅源中加载更多帖子：

```js{5,11-17,21}
export default {
  props: ['type'],

  setup (props) {
    const { result, fetchMore } = useQuery(FEED_QUERY, () => ({
      type: props.type,
      offset: 0,
      limit: 10,
    }))

    function loadMore () {
      fetchMore({
        variables: {
          offset: result.feed.length,
        },
      })
    }

    return {
      result,
      loadMore,
    }
  },
}
```

默认情况下，`fetchMore` 将使用原始的 `query`，因此我们只传入新变量。

从服务器返回新数据后，使用 `updateQuery` 选项将其与现有数据合并，这将使用扩展后的列表重新渲染 UI 组件：

```js{16-28}
export default {
  props: ['type'],

  setup (props) {
    const { result, fetchMore } = useQuery(FEED_QUERY, () => ({
      type: props.type,
      offset: 0,
      limit: 10,
    }))

    function loadMore () {
      fetchMore({
        variables: {
          offset: result.feed.length,
        },
        updateQuery: (previousResult, { fetchMoreResult }) => {
          // No new feed posts
          if (!fetchMoreResult) return previousResult

          // Concat previous feed with new feed posts
          return {
            ...previousResult,
            feed: [
              ...previousResult.feed,
              ...fetchMoreResult.feed,
            ],
          }
        },
      })
    }

    return {
      result,
      loadMore,
    }
  },
}
```

上面的方法非常适合 limit/offset 分页。使用页码或偏移来进行分页的一个缺点是，在同一时间将项目插入了列表或从列表中删除了项目时，某些项目可能被跳过或被返回两次。使用基于游标的分页可以避免这种情况。

注意，为了使 UI 组件在调用 `fetchMore` 之后收到更新的 `loading` ref，你必须在 `useQuery` 的选项中将 `notifyOnNetworkStatusChange` 设置为 `true` 。

## 基于游标

在基于游标的分页中，“游标”被用来跟踪数据集中的下一个项目应该从哪里获取。有时候游标可能非常简单，仅引用获取到的最后一个对象的 ID，但是在某些情况下（例如，根据某些条件排序的列表），除了最后一个对象的 ID 外，游标还需要基于排序条件进行编码。

在客户端上实现基于游标的分页与基于偏移的分页并没有什么不同，区别只是我们没有使用绝对偏移，而是保留了对最后一个获取对象的引用以及使用的排序顺序的信息。

在下面的示例中，我们使用 `fetchMore` 查询来连续加载新帖子，这些帖子将被放在列表的前面。服务端的初始响应提供了将在 `fetchMore` 查询中使用的游标，并在获取更多数据时更新。

```js{2,6-11,28-57}
const FEED_QUERY = gql`
  query getFeed ($type: FeedType!) {
    currentUser {
      login
    }
    feed (type: $type) {
      cursor
      posts {
        id
        # ...
      }
    }
  }
`

export default {
  props: ['type'],

  setup (props) {
    const { result, fetchMore } = useQuery(FEED_QUERY, () => ({
      type: props.type,
      offset: 0,
      limit: 10,
    }))

    function loadMore () {
      fetchMore({
        // 注意这里使用的查询与 `useQuery` 中不同
        query: gql`
          query getMoreFeed ($cursor) {
            moreFeed (type: $type, cursor: $cursor) {
              cursor
              posts {
                id
                # ...
              }
            }
          }
        `,
        variables: {
          cursor: result.feed.cursor,
        },
        updateQuery: (previousResult, { fetchMoreResult }) => {
          return {
            ...previousResult,
            feed: {
              ...previousResult.feed,
              // 更新游标
              cursor: fetchMoreResult.moreFeed.cursor,
              // 将新的帖子与之前的结果合并
              posts: [
                ...previousResult.feed.posts,
                ...fetchMoreResult.moreFeed.posts,
              ],
            }
          }
        },
      })
    }

    return {
      result,
      loadMore,
    }
  },
}
```

## Relay 风格的游标分页

另一个流行的 GraphQL 客户端 Relay 对分页查询的输入和输出有自己的想法，因此人们有时会根据 Relay 的需求来构建服务端的分页模型。如果你有一个被设计用于[Relay 游标连接](https://facebook.github.io/relay/graphql/connections.htm)规范的服务器，则也可以从 Apollo Client 调用该服务器，而不会出现任何问题。

使用 Relay 风格的游标与基于游标的分页非常相似。主要区别在于查询响应的格式会影响你获得游标的位置。

Relay 在返回的游标连接上提供一个 `pageInfo` 对象，它包含了返回的第一项和最后一项的游标，分别作为属性 `startCursor` 和 `endCursor`。该对象还包含布尔值属性 `hasNextPage` ，用于确定是否有更多的可用结果。

以下示例指定一次请求 10 个项目，并且结果应在提供的 `cursor` 之后开始。如果游标传递了 `null`，则 Relay 将忽略它并从数据集的开头提供结果，这允许对初始请求和后续请求使用相同的查询。

```js{2,6-17,32,35-50}
const FEED_QUERY = gql`
  query getFeed ($type: FeedType!, $cursor: String) {
    currentUser {
      login
    }
    feed (type: $type, first: 10, after: $cursor) {
      edges {
        node {
          id
          # ...
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`

export default {
  props: ['type'],

  setup (props) {
    const { result, fetchMore } = useQuery(FEED_QUERY, () => ({
      type: props.type,
    }))

    function loadMore () {
      fetchMore({
        variables: {
          cursor: result.feed.pageInfo.endCursor,
        },
        updateQuery: (previousResult, { fetchMoreResult }) => {
          const newEdges = fetchMoreResult.feed.edges
          const pageInfo = fetchMoreResult.feed.pageInfo

          return newEdges.length ? {
            ...previousResult,
            feed: {
              ...previousResult.feed,
              // 合并边
              edges: [
                ...previousResult.feed.edges,
                ...newEdges,
              ],
              // 覆盖新的 pageInfo
              pageInfo,
            }
          } : previousResult
        },
      })
    }

    return {
      result,
      loadMore,
    }
  },
}
```

## `@connection` 指令

使用分页查询时，很难在存储中找到累积查询的结果，因为传递给查询的参数用于确定默认存储键，但通常在执行查询的代码之外是未知的。这对于必要的存储更新来说是有问题的，因为没有稳定的存储键来确定更新 目标。为了引导 Apollo Client 对分页查询使用稳定的存储键，你可以使用可选的 `@connection` 指令为部分查询指定存储键。例如，如果我们想为之前的订阅源查询提供一个稳定的存储键，我们可以使用 `@connection` 指令来调整查询：

```graphql{5}
query Feed($type: FeedType!, $offset: Int, $limit: Int) {
  currentUser {
    login
  }
  feed(type: $type, offset: $offset, limit: $limit) @connection(key: "feed", filter: ["type"]) {
    id
    # ...
  }
}
```

这样在每个查询或 `fetchMore` 中累积的订阅源被放置在存储中的 `feed` 键下，稍后我们可以使用它来进行必要的存储更新。在这个例子中，我们还使用了 `@connection` 指令的可选 `filter` 参数，该参数允许我们在存储键中包含查询的一些参数。在本例中，我们希望在存储键中包含 `type` 查询参数，这样就会产生多个存储值，分别累积每种类型的订阅源中的页面。
