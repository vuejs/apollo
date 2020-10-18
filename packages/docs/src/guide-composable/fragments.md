# Using fragments

A [GraphQL fragment](http://graphql.org/learn/queries/#fragments) is a shared piece of query logic.

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

It's important to note that the component after the `on` clause is designated for the type we are selecting from. In this case, `people` is of type `Person` and we want to select the `firstName` and `lastName` fields from `people(id: "7")`.

There are two principal uses for fragments in Apollo:

  - Sharing fields between multiple queries, mutations or subscriptions.
  - Breaking your queries up to allow you to co-locate field access with the places they are used.

In this document we'll outline patterns to do both; we'll also make use of utilities in the [`graphql-anywhere`](https://github.com/apollographql/apollo-client/tree/master/packages/graphql-anywhere) and [`graphql-tag`](https://github.com/apollographql/graphql-tag) packages which aim to help us, especially with the second problem.

## Reusing fragments

The most straightforward use of fragments is to reuse parts of queries (or mutations or subscriptions) in various parts of your application. For instance, in GitHunt on the comments page, we want to fetch the same fields after posting a comment as we originally query. This way we can be sure that we render consistent comment objects as the data changes.

To do so, we can simply share a fragment describing the fields we need for a comment:

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

This can be done either in our component `<script>` section or in a sibling `fragments.js` file by convention.

When it's time to embed the fragment in a query, we simply use the `...Name` syntax in our GraphQL document, and embed the fragment inside our query GraphQL document:

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

You can see the full source code to the `CommentsPage` in GitHunt [here](https://github.com/apollographql/GitHunt-React/blob/master/src/routes/CommentsPage.js).

## Colocating fragments

A key advantage of GraphQL is the tree-like nature of the response data, which in many cases mirrors your rendered component hierarchy. This, combined with GraphQL's support for fragments, allows you to split your queries up in such a way that the various fields fetched by the queries are located right alongside the code that uses the field.

Although this technique doesn't always make sense (for instance it's not always the case that the GraphQL schema is driven by the UI requirements), when it does, it's possible to use some patterns in Apollo client to take full advantage of it.

In GitHunt, we show an example of this on the [`FeedPage`](https://github.com/apollographql/GitHunt-React/blob/master/src/routes/FeedPage.js), which constructs the following view hierarchy:

```
FeedPage
└── Feed
    └── FeedEntry
        ├── RepoInfo
        └── VoteButtons
```

The `FeedPage` conducts a query to fetch a list of `Entry`s, and each of the subcomponents requires different subfields of each `Entry`.

The `graphql-anywhere` package gives us tools to easily construct a single query that provides all the fields that each subcomponent needs, and allows to easily pass the exact field that a component needs to it.

### Creating fragments

To create the fragments, we again use the `gql` helper, for example:

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

If our fragments include sub-fragments then we can pass them into the `gql` helper:

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

### Filtering with fragments

We can also use the `graphql-anywhere` package to filter the exact fields from the `entry` before passing them to the subcomponent. So when we render a `VoteButtons.vue`, we can simply do:

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

The `filter()` function will grab exactly the fields from the `entry` that the fragment defines.

### Importing fragments when using Webpack

When loading `.graphql` files with [graphql-tag/loader](https://github.com/apollographql/graphql-tag/blob/master/loader.js), we can include fragments using `import` statements. For example:

```graphql
#import "./someFragment.graphql"

query getSomething {
  something {
    ...SomethingFragment
  }
}
```

Will make the contents of `someFragment.graphql` available to the current file. See the [Webpack Fragments](/integrations/webpack/#fragments) section for additional details.

## Fragments on unions and interfaces

By default, Apollo Client doesn't require any knowledge of the GraphQL schema, which means it's very easy to set up and works with any server and supports even the largest schemas. However, as your usage of Apollo and GraphQL becomes more sophisticated, you may start using fragments on interfaces or unions. Here's an example of a query that uses fragments on an interface:

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

In the query above, `allPeople` returns a result of type `Character[]`. Both `Jedi` and `Droid` are possible concrete types of `Character`, but on the client there is no way to know that without having some information about the schema. By default, Apollo Client's cache will use a heuristic fragment matcher, which assumes that a fragment matched if the result included all the fields in its selection set, and didn't match when any field was missing. This works in most cases, but it also means that Apollo Client cannot check the server response for you, and it cannot tell you when you're manually writing invalid data into the store using `update`, `updateQuery`, `writeQuery`, etc. To inform the cache store about these polymorphic relationships, you need to pass `possibleTypes` option to `InMemoryCache` below.

The section below explains how to pass the necessary schema knowledge to the Apollo Client cache so unions and interfaces can be accurately matched and results validated before writing them into the store.

We recommend setting up a build step that extracts the necessary information from the schema into a JSON file, where it can be imported from when constructing the cache. To set it up, follow the steps below:

1. Query your server / schema to obtain the necessary information about unions and interfaces and write it to a file.

Read the documentation about how to [extract possibleTypes automatically](https://www.apollographql.com/docs/react/data/fragments/#generating-possibletypes-automatically) using an introspection query. Or use the plugin [fragment-matcher](https://graphql-code-generator.com/docs/plugins/fragment-matcher) for graphql-codegen and configure it for [apollo client 3](https://graphql-code-generator.com/docs/plugins/fragment-matcher#usage-with-apollo-client-3).

2. Use `possibleTypes.json` to configure your cache during construction. Then, you pass your newly configured cache to `ApolloClient` to complete the process.

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
