[@vue/apollo-composable](../../../../index.md) / [useFragment](../index.md) / Current

# Interface: Current

Current state

## 1. Operation data

### complete

> **complete**: `boolean`

Whether the fragment data is complete.

***

### missing?

> `optional` **missing**: `MissingTree`

Tree of missing field errors when `complete` is false.

***

### result

> **result**: `object` \| `object`[]

An object containing the result of your GraphQL fragment lookup after it completes.

***

### resultState

> **resultState**: `"complete"` \| `"partial"`

Describes the completeness of `result`.

- `partial`: Some data could be fulfilled from the cache but `result` is incomplete. This is only possible when `returnPartialData` is `true`.

- `complete`: `result` is a fully satisfied query result fulfilled either from the cache or network.
