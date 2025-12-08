[@vue/apollo-composable](../../../../index.md) / [useQuery](../index.md) / FetchMoreOptions

# Interface: FetchMoreOptions

Options for fetchMore.

## 1. Operation options

### errorPolicy?

> `optional` **errorPolicy**: `ErrorPolicy`

Specifies how the query handles a response that returns both GraphQL errors and partial results.

For details, see [GraphQL error policies](https://www.apollographql.com/docs/react/data/error-handling/#graphql-error-policies).

The default value is `none`, meaning that the query result includes error details but not partial results.

***

### query?

> `optional` **query**: `DocumentNode`

A GraphQL query string parsed into an AST with the gql template literal.

***

### variables?

> `optional` **variables**: `OperationVariables`

An object containing all of the GraphQL variables your query requires to execute.

Each key in the object corresponds to a variable name, and that key's value corresponds to the variable value.

## 2. Networking options

### context?

> `optional` **context**: `DefaultContext`

If you're using [Apollo Link](https://www.apollographql.com/docs/react/api/link/introduction/), this object is the initial value of the `context` object that's passed along your link chain.

## 3. Query methods

### updateQuery()?

> `optional` **updateQuery**: (`previousQueryResult`, `options`) => `object`

A function which updates the query result with the new fetchMore result.

#### Parameters

##### previousQueryResult

`object`

##### options

###### fetchMoreResult

`object`

###### variables

`object`

#### Returns

`object`
