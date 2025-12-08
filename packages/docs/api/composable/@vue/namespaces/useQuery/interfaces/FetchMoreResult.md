[@vue/apollo-composable](../../../../index.md) / [useQuery](../index.md) / FetchMoreResult

# Interface: FetchMoreResult

FetchMore result with Vue-Apollo naming.

## 1. Operation data

### error?

> `optional` **error**: `ErrorLike`

A single ErrorLike object describing the error that occurred during the latest
query execution.

For more information, see [Handling operation errors](https://www.apollographql.com/docs/react/data/error-handling/).

***

### result

> **result**: `object` \| `null` \| `undefined`

An object containing the result of your GraphQL query after it completes.

This value might be `undefined` if a query results in one or more errors (depending on the query's `errorPolicy`).
