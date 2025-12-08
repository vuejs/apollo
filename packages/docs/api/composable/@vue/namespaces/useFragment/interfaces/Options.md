[@vue/apollo-composable](../../../../index.md) / [useFragment](../index.md) / Options

# Interface: Options

Options for useFragment.

## 1. Fragment

### fragment

> **fragment**: [`MaybeRefOrGetter`](https://vuejs.org/api/utility-types.html#maybereforgetter)\<`DocumentNode`\>

A GraphQL fragment document.

***

### fragmentName?

> `optional` **fragmentName**: [`MaybeRefOrGetter`](https://vuejs.org/api/utility-types.html#maybereforgetter)\<`string`\>

Name of the fragment to use if document contains multiple fragments.

***

### variables?

> `optional` **variables**: [`MaybeRefOrGetter`](https://vuejs.org/api/utility-types.html#maybereforgetter)\<[`ReactiveVariablesParameter`](../type-aliases/ReactiveVariablesParameter.md)\>

Variables for the fragment.

## 2. Data Source

### from

> **from**: [`MaybeRefOrGetter`](https://vuejs.org/api/utility-types.html#maybereforgetter)\<[`FromValue`](../type-aliases/FromValue.md) \| [`FromValue`](../type-aliases/FromValue.md)[]\>

Cache identifiable entity to read the fragment from.

## 3. Configuration

### clientId?

> `optional` **clientId**: `string`

ID of a named Apollo client to use.

***

### optimistic?

> `optional` **optimistic**: `boolean`

Read from optimistic cache data.

#### Default Value

```ts
true
```

