[@vue/apollo-composable](../../../../index.md) / [useMutation](../index.md) / MutateResult

# Interface: MutateResult

Mutation result returned from mutate().

## Properties

### data

> **data**: `object` \| `undefined`

The mutation result data.

***

### error?

> `optional` **error**: `ErrorLike`

Error if mutation failed.

***

### extensions?

> `optional` **extensions**: `Record`\<`string`, `unknown`\>

Custom extensions returned from the GraphQL server.
