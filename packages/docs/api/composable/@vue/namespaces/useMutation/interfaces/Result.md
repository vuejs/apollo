[@vue/apollo-composable](../../../../index.md) / [useMutation](../index.md) / Result

# Interface: Result

Result returned by useMutation.

## 1. Mutation

### mutate()

> **mutate**: (`options?`) => `Promise`\<[`MutateResult`](MutateResult.md)\>

Call the mutation with optional variables and override options.

#### Parameters

##### options?

[`MutateOptions`](MutateOptions.md)

Variables and options for this mutation call.

#### Returns

`Promise`\<[`MutateResult`](MutateResult.md)\>

Promise resolving to the mutation result.

#### Example

```ts
const { mutate } = useMutation(AddTodo)

// Call with variables
const result = await mutate({ variables: { text: 'New todo' } })

// With optimistic response
await mutate({
  variables: { text: 'New todo' },
  optimisticResponse: {
    addTodo: { __typename: 'Todo', id: 'temp', text: 'New todo', completed: false }
  }
})
```

## 2. Operation data

### error

> **error**: [`Ref`](https://vuejs.org/api/reactivity-core.html#ref)\<`ErrorLike` \| `undefined`\>

If the mutation produces one or more errors, this object contains either an array of `graphQLErrors` or a single `networkError`. Otherwise, this value is `undefined`.

***

### result

> **result**: [`Ref`](https://vuejs.org/api/reactivity-core.html#ref)\<`object` \| `null` \| `undefined`\>

The data returned from your mutation. Can be `undefined` if `errorPolicy` is `all` or `ignore` and the server returns a GraphQL response with `errors` but not `data`, or a network error is returned.

## 3. Network info

### called

> **called**: [`Ref`](https://vuejs.org/api/reactivity-core.html#ref)\<`boolean`\>

If `true`, the mutation's mutate function has been called.

***

### loading

> **loading**: [`Ref`](https://vuejs.org/api/reactivity-core.html#ref)\<`boolean`\>

If `true`, the mutation is currently in flight.

## 4. Lifecycle

### reset()

> **reset**: () => `void`

Reset the mutation's result to its initial, uncalled state.

#### Returns

`void`

## 5. Events

### onDone

> **onDone**: [`EventHookOn`](https://vueuse.org/shared/createEventHook/#type-declarations)\<[`MutateResult`](MutateResult.md)\>

Event triggered when the mutation completes successfully.

***

### onError

> **onError**: [`EventHookOn`](https://vueuse.org/shared/createEventHook/#type-declarations)\<`ErrorLike`\>

Event triggered when the mutation encounters an error.

## 6. Refs

### document

> **document**: [`Ref`](https://vuejs.org/api/reactivity-core.html#ref)\<`DocumentNode`\>

The GraphQL document being mutated.

***

### options

> **options**: [`Ref`](https://vuejs.org/api/reactivity-core.html#ref)\<[`Options`](Options.md) \| `undefined`\>

Current options.
