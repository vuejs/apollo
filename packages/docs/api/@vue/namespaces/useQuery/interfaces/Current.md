[@vue/apollo-composable](../../../../index.md) / [useQuery](../index.md) / Current

# Interface: Current

Current state.

## 1. Operation data

### error?

> `optional` **error**: `ErrorLike`

A single ErrorLike object describing the error that occurred during the latest
query execution.

For more information, see [Handling operation errors](https://www.apollographql.com/docs/react/data/error-handling/).

***

### ~~partial~~

> **partial**: `boolean`

Describes whether `result` is a complete or partial result. This flag is only
set when `returnPartialData` is `true` in query options.

#### Deprecated

This field will be removed in a future version of Apollo Client.

***

### result

> **result**: `object` \| `null` \| `undefined`

An object containing the result of your GraphQL query after it completes.

This value might be `undefined` if a query results in one or more errors (depending on the query's `errorPolicy`).

***

### resultState

> **resultState**: `"complete"` \| `"partial"` \| `"empty"` \| `"streaming"`

Describes the completeness of `result`.

- `empty`: No data could be fulfilled from the cache or the result is
  incomplete. `result` is `undefined`.
- `partial`: Some data could be fulfilled from the cache but `result` is
  incomplete. This is only possible when `returnPartialData` is `true`.
- `streaming`: `result` is incomplete as a result of a deferred query and
  the result is still streaming in.
- `complete`: `result` is a fully satisfied query result fulfilled
  either from the cache or network.

## 2. Network info

### loading

> **loading**: `boolean`

If `true`, the query is still in flight.

***

### networkStatus

> **networkStatus**: `NetworkStatus`

A number indicating the current network state of the query's associated request. [See possible values.](https://github.com/apollographql/apollo-client/blob/d96f4578f89b933c281bb775a39503f6cdb59ee8/src/core/networkStatus.ts#L4)

Used in conjunction with the [`notifyOnNetworkStatusChange`](./Options.md#notifyonnetworkstatuschange) option.
