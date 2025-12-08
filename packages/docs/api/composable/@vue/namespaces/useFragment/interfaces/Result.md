[@vue/apollo-composable](../../../../index.md) / [useFragment](../index.md) / Result

# Interface: Result

Result returned by useFragment.

## 1. Operation data

### complete

> **complete**: [`Ref`](https://vuejs.org/api/reactivity-core.html#ref)\<`boolean`\>

Whether the fragment data is complete.

***

### current

> **current**: [`Ref`](https://vuejs.org/api/reactivity-core.html#ref)\<[`Current`](Current.md)\>

Current state as a discriminated union type.

***

### missing

> **missing**: [`Ref`](https://vuejs.org/api/reactivity-core.html#ref)\<`MissingTree`\>

Tree of missing field errors when `complete` is false.

***

### result

> **result**: [`Ref`](https://vuejs.org/api/reactivity-core.html#ref)\<`object` \| `object`[]\>

An object containing the result of your GraphQL fragment lookup after it completes.

***

### resultState

> **resultState**: [`Ref`](https://vuejs.org/api/reactivity-core.html#ref)\<`"complete"` \| `"partial"`\>

Describes the completeness of `result`.

- `partial`: Some data could be fulfilled from the cache but `result` is incomplete. This is only possible when `returnPartialData` is `true`.

- `complete`: `result` is a fully satisfied query result fulfilled either from the cache or network.

## 2. Events

### onNextState

> **onNextState**: [`EventHookOn`](https://vueuse.org/shared/createEventHook/#type-declarations)\<[`Current`](Current.md)\>

Event triggered when fragment data changes.
