[@vue/apollo-composable](../../../../index.md) / [useQuery](../index.md) / SubscribeToMoreOptions

# Interface: SubscribeToMoreOptions

Options for subscribeToMore.

## 1. Operation options

### document

> **document**: `DocumentNode`

A GraphQL subscription document parsed into an AST with the gql template literal.

***

### variables?

> `optional` **variables**: `OperationVariables`

An object containing all of the GraphQL variables your subscription requires to execute.

## 2. Networking options

### context?

> `optional` **context**: `DefaultContext`

If you're using [Apollo Link](https://www.apollographql.com/docs/react/api/link/introduction/), this object is the initial value of the `context` object that's passed along your link chain.

## 3. Query methods

### onError()?

> `optional` **onError**: (`error`) => `void`

A callback function that's called when the subscription encounters an error.

#### Parameters

##### error

`Error`

#### Returns

`void`

***

### updateQuery()?

> `optional` **updateQuery**: (`unsafePreviousData`, `options`) => `object`

A function that defines how incoming subscription data is merged with the existing query data.

::: warning First argument is deprecated

The first argument (`unsafePreviousData`) is not type-safe and may contain partial data.
It will be removed in Apollo Client v5. Use `options.previousData` instead.

:::

#### Parameters

##### unsafePreviousData

`object`

##### options

###### previousData

`object`

###### subscriptionData

\{ `data`: `object`; \}

###### subscriptionData.data

`object`

#### Returns

`object`
