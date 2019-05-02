# ApolloSubscribeToMore component

## Props

- `document`: GraphQL document that contains the subscription or a function that receives the `gql` tag as argument and should return the transformed document.
- `variables`: Object which will automatically update the subscription variables.
- `updateQuery`: Function in which on can update the query result if needed.
