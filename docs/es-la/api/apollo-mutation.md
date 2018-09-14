# Componente ApolloMutation

## Props

- `mutation`: Consulta GraphQL (transformada por `graphql-tag`)
- `variables`: Objeto de variables GraphQL 
- `optimisticResponse`: Ver [optimistic UI](https://www.apollographql.com/docs/react/features/optimistic-ui.html)
- `update`: Ver [updating cache after mutation](https://www.apollographql.com/docs/react/api/react-apollo.html#graphql-mutation-options-update)
- `refetchQueries`: Ver [refetching queries after mutation](https://www.apollographql.com/docs/react/api/react-apollo.html#graphql-mutation-options-refetchQueries)
- `clientId`: Se usa para resolver el cliente Apollo utilizado (definido en ApolloProvider)
- `tag`: Etiqueta String HTML (predeterminado: `div`); si es `undefined`, el componente será 'renderless' (el contenido no se incluirá en una etiqueta)

## Scoped slot props

- `mutate(options = undefined)`: Función para llamar a la mutación. Puede anular las opciones de mutación (por ejemplo: `mutate({ variables: { foo: 'bar } })`)
- `loading`: Booleano que indica que la solicitud está en proceso
- `error`: Error eventual para la última llamada de mutación
- `gqlError`: error Primer GraphQL si lo hubiere.

## Eventos

- `done(resultObject)`
- `error(errorObject)`
