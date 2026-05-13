[@vue/apollo-composable](../../../../index.md) / [useMutation](../index.md) / MutateOptions

# Interface: MutateOptions

Options when calling the mutate function.

## 1. Operation options

### errorPolicy?

> `optional` **errorPolicy**: `ErrorPolicy`

Specifies how the mutation handles a response that returns both GraphQL errors and partial results.

The default value is `none`, meaning that the mutation result includes error details but _not_ partial results.

***

### optimisticResponse?

> `optional` **optimisticResponse**: `object` \| (`vars`) => `object`

By providing either an object or a callback function that, when invoked after a mutation, allows you to return optimistic data and optionally skip updates via the `IGNORE` sentinel object, Apollo Client caches this temporary (and potentially incorrect) response until the mutation completes, enabling more responsive UI updates.

***

### variables?

> `optional` **variables**: `OperationVariables`

Variables for this mutation call.

## 2. Networking options

### context?

> `optional` **context**: `DefaultContext` \| (`composableContext`) => `DefaultContext`

Context can be a callback or object.

## 3. Caching options

### awaitRefetchQueries?

> `optional` **awaitRefetchQueries**: `boolean`

If `true`, makes sure all queries included in `refetchQueries` are completed before the mutation is considered complete.

#### Default

```ts
false
```

***

### fetchPolicy?

> `optional` **fetchPolicy**: `MutationFetchPolicy`

Provide `no-cache` if the mutation's result should _not_ be written to the Apollo Client cache.

The default value is `network-only` (which means the result _is_ written to the cache).

***

### keepRootFields?

> `optional` **keepRootFields**: `boolean`

If `true`, keeps ROOT_MUTATION fields in the cache after mutation completes. By default, Apollo Client clears these to avoid retaining sensitive data.

***

### onQueryUpdated()?

> `optional` **onQueryUpdated**: (`observableQuery`) => `boolean` \| `Promise`\<`unknown`\>

Optional callback for intercepting queries whose cache data has been updated by the mutation, as well as any queries specified in the `refetchQueries: [...]` list passed to `client.mutate`.

Returning a `Promise` from `onQueryUpdated` will cause the final mutation `Promise` to await the returned `Promise`. Returning `false` causes the query to be ignored.

#### Parameters

##### observableQuery

`object`

#### Returns

`boolean` \| `Promise`\<`unknown`\>

***

### refetchQueries?

> `optional` **refetchQueries**: (`string` \| \{ `query`: `DocumentNode`; `variables?`: `object`; \})[] \| (`result`) => (`string` \| \{ `query`: `DocumentNode`; `variables?`: `object`; \})[]

An array (or a function that _returns_ an array) that specifies which queries you want to refetch after the mutation occurs.

Each array value can be either:

- An object containing the `query` to execute, along with any `variables`

- A string indicating the operation name of the query to refetch

***

### update()?

> `optional` **update**: (`cache`, `result`) => `void`

A function used to update the Apollo Client cache after the mutation completes.

#### Parameters

##### cache

`ApolloCache`

##### result

###### data?

`object`

#### Returns

`void`

***

### updateQueries?

> `optional` **updateQueries**: `Record`\<`string`, (`prev`, `options`) => `object`\>

A `MutationQueryReducersMap`, which is map from query names to mutation query reducers. Briefly, this map defines how to incorporate the results of the mutation into the results of queries that are currently being watched by your application.

