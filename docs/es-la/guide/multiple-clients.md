# Clientes Multiples

Puede especificar clientes apollo multiples si su app necesita conectarse a endpoints de GraphQL diferentes:

```js
const apolloProvider = new VueApollo({
  clients: {
    a: apolloClient,
    b: otherApolloClient,
  },
  defaultClient: apolloClient,
})
```
En la opción `apollo` del componente, puede definir el cliente para todas las consultas, subscripciones y mutations con `$client` (sólo para este componente):

```js
export default {
  apollo: {
    $client: 'b',
  },
}
```

También puede especificar el cliente en consultas individuales, subscripciones y mutations con la propiedad `client` en las opciones:

```js
tags: {
  query: gql`...`,
  client: 'b',
}
```