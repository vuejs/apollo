[@vue/apollo-composable](../../../../index.md) / [useQuery](../index.md) / Result

# Interface: Result

Result returned by useQuery.

## Extended by

- [`Result`](../../useLazyQuery/interfaces/Result.md)

## 1. Operation data

### current

> **current**: [`Ref`](https://vuejs.org/api/reactivity-core.html#ref)\<[`Current`](Current.md)\>

Current state as a discriminated union type.

***

### error

> **error**: [`Ref`](https://vuejs.org/api/reactivity-core.html#ref)\<`ErrorLike` \| `undefined`\>

A single ErrorLike object describing the error that occurred during the latest query execution.

For more information, see [Handling operation errors](https://www.apollographql.com/docs/react/data/error-handling/).

***

### result

> **result**: [`Ref`](https://vuejs.org/api/reactivity-core.html#ref)\<`object` \| `null`\>

An object containing the result of your GraphQL query after it completes.

This value might be `undefined` if a query results in one or more errors (depending on the query's `errorPolicy`).

## 2. Network info

### loading

> **loading**: [`Ref`](https://vuejs.org/api/reactivity-core.html#ref)\<`boolean`\>

If `true`, the query is still in flight.

***

### networkStatus

> **networkStatus**: [`Ref`](https://vuejs.org/api/reactivity-core.html#ref)\<`NetworkStatus`\>

A number indicating the current network state of the query's associated request. [See possible values.](https://github.com/apollographql/apollo-client/blob/d96f4578f89b933c281bb775a39503f6cdb59ee8/src/core/networkStatus.ts#L4)

Used in conjunction with the [`notifyOnNetworkStatusChange`](./Options.md#notifyonnetworkstatuschange) option.

## 3. Refs

### document

> **document**: [`Ref`](https://vuejs.org/api/reactivity-core.html#ref)\<`DocumentNode`\>

The GraphQL document being queried.

***

### options

> **options**: [`Ref`](https://vuejs.org/api/reactivity-core.html#ref)\<[`Options`](Options.md)\>

Current options.

***

### query

> **query**: [`Ref`](https://vuejs.org/api/reactivity-core.html#ref)\<`ObservableQuery`\<`unknown`, `OperationVariables`\> \| `undefined`\>

The underlying Apollo ObservableQuery instance. Undefined when the query is stopped.

***

### variables

> **variables**: [`Ref`](https://vuejs.org/api/reactivity-core.html#ref)\<`OperationVariables`\>

Current variables being sent to the query (after debounce/throttle).

## 4. Lifecycle

### restart()

> **restart**: () => `Promise`\<`void`\>

Stop and restart the query.

#### Returns

`Promise`\<`void`\>

***

### start()

> **start**: () => `void`

Start the query. Has no effect if the query is already active or if `enabled` option is `false`.

#### Returns

`void`

***

### stop()

> **stop**: () => `void`

Stop the query. The query can be restarted by calling [start](#start).

#### Returns

`void`

## 5. Query methods

### fetchMore()

> **fetchMore**: (`options`) => `Promise`\<[`FetchMoreResult`](FetchMoreResult.md)\> \| `undefined`

Fetch more data for pagination or infinite scroll.

Use this to load additional items (e.g., next page) and merge them with existing results. The reactive refs will update automatically when the fetch completes.

::: tip How data is merged

You can merge data in two ways:

1. **`updateQuery` callback** - Manually merge `fetchMoreResult` with `previousQueryResult`

2. **Field policies** - Define `merge` functions in your Apollo cache configuration

If using `fetchPolicy: 'no-cache'`, you **must** provide `updateQuery`.

:::

#### Parameters

##### options

[`FetchMoreOptions`](FetchMoreOptions.md)

Options including variables for the next page and optional updateQuery.

#### Returns

`Promise`\<[`FetchMoreResult`](FetchMoreResult.md)\> \| `undefined`

Promise resolving to the fetchMore result, or `undefined` if query is stopped.

#### Example

```ts
const { result, fetchMore } = useQuery(GetPosts, {
  variables: { offset: 0, limit: 10 }
})

async function loadMore() {
  await fetchMore({
    variables: { offset: result.value.posts.length },
    updateQuery: (previousQueryResult, { fetchMoreResult }) => ({
      ...previousQueryResult,
      posts: [...previousQueryResult.posts, ...fetchMoreResult.posts]
    })
  })
}
```

***

### refetch()

> **refetch**: (`variables?`) => `Promise`\<`RenameKey`\<`QueryResult`\<`unknown`\>, `"data"`, `"result"`\> \| `undefined`\>

Re-execute the query, optionally with new variables.

Use this for imperative refetching (e.g., "refresh" buttons, pull-to-refresh).
The reactive `current`, `result`, `loading`, etc. refs will update automatically
when the refetch completes.

::: tip When to use refetch vs reactive variables

- Use **reactive `variables`** in options for variables that should stay in sync
  with your component state (e.g., route params, form inputs).
- Use **`refetch()`** for one-time imperative fetches that don't need to persist.

:::

::: warning Variables passed to refetch are temporary

If you pass variables to `refetch({ id: 2 })`, Apollo uses them for this single
request only. The exposed `variables` ref will **not** update. If your reactive
`options.variables` changes later, the query will use those values, not the ones
passed to refetch.

:::

#### Parameters

##### variables?

`OperationVariables`

Optional variables to use for this refetch only.

#### Returns

`Promise`\<`RenameKey`\<`QueryResult`\<`unknown`\>, `"data"`, `"result"`\> \| `undefined`\>

Promise resolving to the query result, or `undefined` if query is stopped.

#### Example

```ts
const { refetch } = useQuery(GetUser, { variables: { id: userId } })

// Re-run with current variables
await refetch()

// One-time refetch with different variables
await refetch({ id: 'other-user' })
```

***

### subscribeToMore()

> **subscribeToMore**: (`options`) => () => `void` \| `undefined`

Subscribe to additional data and merge it with the query result.

Use this to add real-time updates to a query via GraphQL subscriptions. When subscription data arrives, the `updateQuery` callback merges it with the existing query data.

::: tip Automatic cleanup

The subscription is automatically cleaned up when the query is stopped or the component is unmounted. You can also manually unsubscribe by calling the returned function.

:::

#### Parameters

##### options

[`SubscribeToMoreOptions`](SubscribeToMoreOptions.md)

Subscription options including document, variables, and updateQuery.

#### Returns

() => `void` \| `undefined`

Unsubscribe function to manually stop the subscription.

#### Example

```ts
const { subscribeToMore } = useQuery(GetMessages, {
  variables: { channelId }
})

// Subscribe to new messages
const unsubscribe = subscribeToMore({
  document: OnMessageAdded,
  variables: { channelId },
  updateQuery: (_, { previousData, subscriptionData }) => {
    if (!subscriptionData.data) return previousData
    return {
      ...previousData,
      messages: [...previousData.messages, subscriptionData.data.messageAdded]
    }
  }
})

// Optionally unsubscribe manually
onUnmounted(() => unsubscribe())
```

***

### updateQuery()

> **updateQuery**: (`mapFn`) => `void`

Directly update the cached query result.

Use this to optimistically update the cache or modify data without a network request. The reactive refs will update automatically when the cache is written.

::: warning Use sparingly

Prefer cache field policies or [`client.writeQuery`](https://www.apollographql.com/docs/react/api/core/ApolloClient#writequery) for most cache updates. `updateQuery` is useful for quick local modifications but bypasses Apollo's normal cache update mechanisms.

:::

#### Parameters

##### mapFn

(`unsafePreviousData`, `options`) => `object`

Function that receives current data and returns new data.

#### Returns

`void`

#### Example

```ts
const { updateQuery } = useQuery(GetTodos)

function addOptimisticTodo(todo: Todo) {
  updateQuery((_, { previousData }) => ({
    ...previousData,
    todos: [...previousData.todos, todo]
  }))
}
```

## 6. Events

### onCompleteResult

> **onCompleteResult**: [`EventHookOn`](https://vueuse.org/shared/createEventHook/#type-declarations)\<`object`\>

Event triggered when a complete query result is received.

Fires only when `resultState` is `'complete'`.

***

### onError

> **onError**: [`EventHookOn`](https://vueuse.org/shared/createEventHook/#type-declarations)\<`ErrorLike`\>

Event triggered when a query error occurs.

***

### onNextState

> **onNextState**: [`EventHookOn`](https://vueuse.org/shared/createEventHook/#type-declarations)\<[`Current`](Current.md)\>

Event triggered when the query state changes.

This is the most granular event - it fires on every state update including loading states, network status changes, and result updates.

***

### onPartialResult

> **onPartialResult**: [`EventHookOn`](https://vueuse.org/shared/createEventHook/#type-declarations)\<`object`\>

Event triggered when a partial query result is received.

Fires only when `resultState` is `'partial'`. Requires `returnPartialData: true`.

***

### onResult

> **onResult**: [`EventHookOn`](https://vueuse.org/shared/createEventHook/#type-declarations)\<`object`\>

Event triggered when query result data is received.

Fires when `resultState` is `'complete'`, `'partial'`, or `'streaming'`. Does not fire for `'empty'` state or errors.

***

### onStreamingResult

> **onStreamingResult**: [`EventHookOn`](https://vueuse.org/shared/createEventHook/#type-declarations)\<`object`\>

Event triggered when streaming query data is received.

Fires only when `resultState` is `'streaming'`. Use with `@defer` or `@stream` directive.
