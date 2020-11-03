# 使用片段

[GraphQL 片段](http://graphql.org/learn/queries/#fragments) 是一段共享的查询逻辑。

```graphql
fragment NameParts on Person {
  firstName
  lastName
}

query GetPerson {
  people(id: "7") {
    ...NameParts
    avatar(size: LARGE)
  }
}
```

需要注意的是，`on` 子句后面的组件是根据我们要选择的类型指定的。在这种情况下，`people` 的类型为 `Person`，我们要从 `people(id: "7")` 中选择 `firstName` 和 `lastName` 字段。

在 Apollo 中片段有两个主要用途：

- 在多个查询、变更或订阅之间共享字段。
- 分解你的查询，以使你可以将字段的访问与需要使用字段的地方放在一起。

在本文档中，我们将概述两种模式。我们还将利用 [`graphql-anywhere`](https://github.com/apollographql/apollo-client/tree/master/packages/graphql-anywhere) 和 [`graphql-tag`](https://github.com/apollographql/graphql-tag) 两个包中的实用工具来帮助我们，尤其是第二个问题。

## 重用片段

片段最直接的用法是在应用的各个部分中重用部分查询（或是变更、订阅）。例如，在评论页面上的 GitHunt 中，我们希望在发布评论后获取与最初查询相同的字段。这样我们就可以确保在数据更改时渲染出一致的评论对象。

为此，我们可以简单地共享一个片段，来描述我们在评论中需要的字段：

```js
import gql from 'graphql-tag'

export const commentFragment = {
  comment: gql`
    fragment CommentsPageComment on Comment {
      id
      postedBy {
        login
        htmlUrl
      }
      createdAt
      content
    }
  `,
}
```

按照惯例，这可以在组件的 `<script>` 部分或同级的 `fragments.js` 文件中完成。

当需要将片段嵌入查询中时，我们只需在 GraphQL 文档中使用 `...Name` 语法，将片段嵌入到查询的 GraphQL 文档中即可：

```js
const SUBMIT_COMMENT_MUTATION = gql`
  mutation SubmitComment($repoFullName: String!, $commentContent: String!) {
    submitComment(repoFullName: $repoFullName, commentContent: $commentContent) {
      ...CommentsPageComment
    }
  }
  ${commentFragment}
`

export const COMMENT_QUERY = gql`
  query Comment($repoName: String!) {
    # ...
    entry(repoFullName: $repoName) {
      # ...
      comments {
        ...CommentsPageComment
      }
      # ...
    }
  }
  ${commentFragment}
`
```

你可以在 [这里](https://github.com/apollographql/GitHunt-React/blob/master/src/routes/CommentsPage.js) 查看 GitHunt 中 `CommentsPage` 的完整源代码。

## 碎片定位

GraphQL 的一个关键优势是响应数据的树状性质，它在许多情况下都反映了渲染组件的层次结构。结合 GraphQL 对片段的支持，你可以将查询分拆开来，以使查询所获取的各个字段位于使用该字段的代码的旁边。

尽管这种技术并不总是有意义的（例如，GraphQL 模式并非总是由 UI 需求驱动），但当需要时，可以在 Apollo 客户端中使用某些模式来充分利用它。

在 GitHunt 中，我们在 [`FeedPage`](https://github.com/apollographql/GitHunt-React/blob/master/src/routes/FeedPage.js) 上展示了一个示例，它构建了如下的视图层次结构：

```
FeedPage
└── Feed
    └── FeedEntry
        ├── RepoInfo
        └── VoteButtons
```

`FeedPage` 会执行查询以获取 `Entry` 的列表，并且每个子组件都需要每个 `Entry` 的不同子字段。

`graphql-anywhere` 包为我们提供了轻松构建单个查询的工具，该查询提供了每个子组件所需的所有字段，并可以轻松地将组件所需的确切字段传递给它。

### 创建片段

为了创建片段，我们再次使用 `gql` 辅助工具，例如：

```js
// VueButtons.vue

export const entryFragment = gql`
  fragment VoteButtons on Entry {
    score
    vote {
      voteValue
    }
  }
`
```

如果我们的片段包含子片段，那么我们可以将它们传递到 `gql` 中：

```js
import { entryFragment as VoteButtonsEntryFragment } from './VoteButtons.vue'
import { entryFragment as RepoInfoEntryFragment } from './RepoInfo.vue'

export const entryFragment = gql`
  fragment FeedEntry on Entry {
    commentCount
    repository {
      fullName
      htmlUrl
      owner {
        avatarUrl
      }
    }
    ...VoteButtons
    ...RepoInfo
  }
  ${VoteButtonsEntryFragment}
  ${RepoInfoEntryFragment}
`
```

### 用片段筛选

我们还可以使用 `graphql-anywhere` 包从 `entry` 中筛选出确切的字段，然后再将其传递给子组件。因此，当我们渲染 `VoteButtons.vue` 时，我们可以简单地做到：

```vue
<script>
import { filter } from 'graphql-anywhere'
import { entryFragment as VoteButtonsEntryFragment } from './VoteButtons.vue'

setup () {
  return {
    entry: ...,
    filterVoteButtonEntry: entry => filter(VoteButtonsEntryFragment, entry),
  }
}
</script>

<template>
  <VoteButtons
    :entry="filterVoteButtonEntry(entry)"
  />
</template>
```

`filter()` 函数将从片段定义的 `entry` 中准确地获取字段。

### 使用 Webpack 时导入片段

当使用 [graphql-tag/loader](https://github.com/apollographql/graphql-tag/blob/master/loader.js) 加载 `.graphql` 文件时，我们可以使用 `import` 语句引入片段。例如：

```graphql
#import "./someFragment.graphql"

query getSomething {
  something {
    ...SomethingFragment
  }
}
```

将使 `someFragment.graphql` 的内容在当前文件可用。请参见 [Webpack 片段](/integrations/webpack/#fragments) 了解更多详细信息。

## 联合和接口上的片段

默认情况下，Apollo Client 不需要任何与 GraphQL schema 相关的知识，这意味着它很容易设置并能够与任何服务端一起使用，甚至支持最大的 schema。但是，随着对 Apollo 和 GraphQL 的使用变得越来越复杂，你可能需要在接口或联合上使用片段。下面是一个在接口上使用片段的查询示例：

```graphql
query {
  allPeople {
    ... on Character {
      name
    }
    ... on Jedi {
      side
    }
    ... on Droid {
      model
    }
  }
}
```

在上面的查询中，`allPeople` 返回一个类型为 `Character[]` 的结果。 `Jedi` 和 `Droid` 都是 `Character` 可能的具体类型，但是在客户端上，如果没有一些关于 schema 的信息就无法知道这一点。默认情况下，Apollo Client 的缓存将使用启发式的片段匹配器，它假定如果结果包括了选择集中的所有字段，则片段已匹配，而在缺少任何字段时不匹配。在大多数情况下这样做都是有效的，但这也意味着 Apollo Client 无法为你检查服务端的响应，并且当你使用 `update`、`updateQuery`、`writeQuery` 等方法手动将无效数据写入了存储中时，它无法告诉你。为了将这些多态关系通知到缓存存储，你需要将 `possibleTypes` 选项传递给下面的 `InMemoryCache`。

下面一节说明了如何将必要的 schema 信息传递到 Apollo Client 缓存，以便在将联合和接口写入存储之前，就可以精确地匹配它们并验证结果。

我们建议设置一个构建步骤，将必要信息从 schema 中提取到 JSON 文件中，以便在构建缓存时将其导入。要进行设置，请按照以下步骤操作：

1. 查询服务器/schema 以获得有关联合和接口的必要信息，并将其写入文件。

阅读如何使用内省查询来 [自动提取 possibleTypes](https://www.apollographql.com/docs/react/data/fragments/#generating-possibletypes-automatically) 的文档。或为 graphql-codegen 使用插件[fragment-matcher](https://graphql-code-generator.com/docs/plugins/fragment-matcher) 并为 [apollo client 3](https://graphql-code-generator.com/docs/plugins/fragment-matcher#usage-with-apollo-client-3) 配置它。

2. 在构建过程中，使用 `possibleTypes.json` 来配置缓存。然后，将新配置的缓存传递给 `ApolloClient` 以完成这个过程。

```js
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client/core'
import possibleTypes from './possibleTypes.json'

const cache = new InMemoryCache({ possibleTypes })
const httpLink = createHttpLink({ uri });

const client = new ApolloClient({
  cache,
  link: httpLink,
})
```
