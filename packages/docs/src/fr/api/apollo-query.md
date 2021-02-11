# Composant ApolloQuery

Exemple :

```vue
<ApolloQuery
  :query="gql => gql`
    query MyHelloQuery ($name: String!) {
      hello (name: $name)
    }
  `"
  :variables="{ name }"
>
  <template v-slot="{ result: { error, data }, isLoading }">
    <!-- Chargement -->
    <div v-if="isLoading" class="loading apollo">Chargement...</div>

    <!-- Erreur -->
    <div v-else-if="error" class="error apollo">Une erreur est survenue.</div>

    <!-- Résultat -->
    <div v-else-if="data" class="result apollo">{{ data.hello }}</div>

    <!-- Pas de résultat -->
    <div v-else class="no-result apollo">Pas de résultat :(</div>
  </template>
</ApolloQuery>
```

::: warning
Pour activer le support du gabarit étiqueté `gql` dans les templates Vue, consultez l'étape nécessaire dans [le guide](../guide/components/query.md#tag-setup).
:::

## Props

- `query`: une requête GraphQL (transformée par `graphql-tag`) ou bien une fonction qui reçoit le gabarit `gql` comme argument et doit retourner la requête transformée
- `variables`: objet de variables GraphQL
- `fetchPolicy`: consultez [l'option `fetchPolicy` d'Apollo](https://www.apollographql.com/docs/react/data/queries/#options)
- `pollInterval`: consultez [l'option `pollInterval` d'Apollo](https://www.apollographql.com/docs/react/data/queries/#options)
- `notifyOnNetworkStatusChange`: consultez [l'option `notifyOnNetworkStatusChange` d'Apollo](https://www.apollographql.com/docs/react/data/queries/#options)
- `context`: consultez [l'option `context` d'Apollo](https://www.apollographql.com/docs/react/data/queries/#options)
- `update`: une fonction qui transforme le résultat `data`, pratique pour récupérer des parties spécifiques de la réponse. Exemple : `:update="data => data.user.messages"`
- `skip`: un booléen qui désative le requêtage
- `clientId`: l'identifiant du client Apollo utilisé par la requête (défini dans l'option `clients` d'ApolloProvider)
- `deep`: booléen pour permettre l'utilisation d'observateurs Vue imbriqués
- `tag`: le nom de la balise HTML (par défaut: `div`); si évalue à `false` (par exemple `null` ou `undefined`), le composant n'a pas de rendu (le contenu ne sera pas englobé dans une balise), et dans ce cas, uniquement le premier enfant sera rendu
- `debounce`: nombre de millisecondes pour stabiliser les nouvelles requêtes (par exemple quand les variables changent)
- `throttle`: nombre de millisecondes pour réguler les nouvelles requêtes (par exemple quand les variables changent)
- `prefetch`: si `false`, pas de pré-requête lors du rendu côté serveur (SSR)
- `options`: autres options Apollo Watch Query

## Slots avec portée

- `result`: résulta Apollo Query
  - `result.data`: donnée retournée par la requête (peut être transformée dans la prop `update`)
  - `result.fullData`: donnée brute retournée par la requête (non transformée dans la prop `update`)
  - `result.loading`: un booléen qui indique si requête est en cours (il est possible que vous deviez assigner la prop `notifyOnNetworkStatusChange` pour qu'il se mette à jour)
  - `result.error`: erreur évntuelle pour le résultat en cours
  - `result.networkStatus`: consultez [l'option `networkStatus` d'Apollo](https://www.apollographql.com/docs/react/data/queries/#result)
- `query`: requête intelligente associée au composant. C'est pratique pour exécuter certaines opérations comme `query.refetch` ou bien `query.fetchMore`.
- `isLoading`: état de chargement de la requête intelligente
- `gqlError`: la première erreur GraphQL évntuelle
- `times`: combien de fois le résultat a été mis à jour

## Événements

- `result(resultObject)`
- `error(errorObject)`
- `loading(boolean)`
