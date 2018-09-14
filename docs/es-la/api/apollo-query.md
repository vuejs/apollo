# Componente ApolloQuery

## Props

- `query`: Consulta GraphQL(transformada por `graphql-tag`)
- `variables`: Objeto de variables GraphQL 
- `fetchPolicy`: Ver [apollo fetchPolicy](https://www.apollographql.com/docs/react/basics/queries.html#graphql-config-options-fetchPolicy)
- `pollInterval`: Ver [apollo pollInterval](https://www.apollographql.com/docs/react/basics/queries.html#graphql-config-options-pollInterval)
- `notifyOnNetworkStatusChange`: Ver [apollo notifyOnNetworkStatusChange](https://www.apollographql.com/docs/react/basics/queries.html#graphql-config-options-notifyOnNetworkStatusChange)
- `context`: Ver [apollo context](https://www.apollographql.com/docs/react/basics/queries.html#graphql-config-options-context)
- `skip`: Boolean que inhabilita búsqueda de consulta
- `clientId`: se usa para resolver el cliente Apollo utilizado (definido en ApolloProvider)
- `deep`: booleano para usar watchers Vue profundos
- `tag`: nombre de la etiqueta HTML String (predeterminado:` div`); si es `undefined`, el componente será 'renderless' (el contenido no se incluirá en una etiqueta)
- `debounce`: Número de milisegundos para refetches supresión de rebotes (por ejemplo cuando las variables se cambian)
- `throttle`: Número de milisegundos para reencauchamientos (por ejemplo, cuando se cambian las variables)

## Scoped slot

- `result`: resultado de Apollo Query
  - `result.data`: datos devueltos por la consulta
  - `result.loading`: booleano que indica que una solicitud está en proceso
  - `result.error`: error eventual para el resultado actual
  - `result.networkStatus`: Ver [apollo networkStatus](https://www.apollographql.com/docs/react/basics/queries.html#graphql-query-data-networkStatus)
- `query`: Smart Query asociado con el componente
- `isLoading`: estado de carga de Smart Query
- `gqlError`: primer error de GraphQL si hubiere alguno
- `times`: número de veces que se actualizó el resultado

## Eventos

- `result(resultObject)`
- `error(errorObject)`
