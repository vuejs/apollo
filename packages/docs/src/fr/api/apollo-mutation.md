# Composant ApolloMutation

Exemple :

```vue
<ApolloMutation
  :mutation="gql => gql`
    mutation DoStuff ($name: String!) {
      someWork (name: $name) {
        success
        timeSpent
      }
    }
  `"
  :variables="{
    name
  }"
  @done="onDone"
>
  <template v-slot="{ mutate, loading, error }">
    <button :disabled="loading" @click="mutate()">Cliquez ici</button>
    <p v-if="error">Une erreur est survenue : {{ error }}</p>
  </template>
</ApolloMutation>
```

## Props

- `mutation`: une requête GraphQL (transformée par `graphql-tag`) ou bien une fonction qui reçoit le gabarit `gql` comme argument et doit retourner la requête transformée
- `variables`: objet de variables GraphQL
- `optimisticResponse`: Consultez le guide sur [les interfaces optimistes](https://www.apollographql.com/docs/react/performance/optimistic-ui/)
- `update`: Consultez le guide sur [comment mettre à jour le cache après une mutation](https://www.apollographql.com/docs/react/data/mutations/#options)
- `refetchQueries`: Consultez le guide sur [comment re-requêter après une mutation](https://www.apollographql.com/docs/react/data/mutations/#options)
- `clientId`: l'identifiant du client Apollo utilisé par la requête (défini dans l'option `clients` d'ApolloProvider)
- `tag`: le nom de la balise HTML (par défaut: `div`); si `undefined`, le composant n'a pas de rendu (le contenu ne sera pas englobé dans une balise)
- `context`: Consultez [l'option `context` d'Apollo](https://www.apollographql.com/docs/react/data/mutations/#options)

## Les props de slots avec portée

- `mutate(options = undefined)`: une fonction pour appeler une mutation. Vous pouvez écraser les options de mutation (par exemple : `mutate({ variables: { foo: 'bar } })`)
- `loading`: un booléen qui indique que la requête est en cours
- `error`: un erreur évntuelle lors de la dernière mutation
- `gqlError`: la première erreur GraphQL évntuelle

## Événements

- `done(resultObject)`
- `error(errorObject)`
- `loading(boolean)`
