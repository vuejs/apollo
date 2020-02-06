# Requête intelligente

Chaque requête déclarée dans la définition `apollo` (c'est-à-dire, qui ne commence pas avec un signe `$`) d'un composant donne lieu à la création d'une requête intelligente.

## Options

- `query`: document GraphQL (un fichier ou une chaîne `gql`).
- `variables`: un objet ou une fonction réactive qui retourne un objet. Chaque clé est mappée avec un `'$'` dans le document GraphQL, par exemple `foo` devient `$foo`.
- `throttle`: régule les mises à jour des variables (en millisecondes).
- `debounce`: stabilise les mises à jour des variables (en millisecondes).
- `pollInterval`: mise à jour automatique en utilisant le *polling* (en requêtant toutes les `x` millisecondes). Par défaut : `undefined`, `0` - arrêt du polling.
- `update(data) {return ...}` pour personnaliser la valeur qui est assignée dans la propriété Vue, par exemple si les noms de champs ne correspondent pas.
- `result(ApolloQueryResult, key)` est un hook appelé lorsqu'un résultat est reçu (consultez la documentation de [ApolloQueryResult](https://github.com/apollographql/apollo-client/blob/master/src/core/types.ts)). `key` est la clé de requête dans l'option `apollo`.
- `error(error, vm, key, type, options)` est un hook appelé lorsqu'une erreur survient. `error` est une erreur Apollo avec soit une propriété `graphQLErrors` ou bien une propriété `networkError`. `vm` est l'instance du composant correspondant. `key` est la clé de la requête intelligente. `type` est soit `'query'` ou `'subscription'`. `options` est l'objet d'options `watchQuery` final.
- `loadingKey` met à jour la propriété de donnée du composant passée en valeur. Vous devez initialiser cette propriété à `0` dans le hook `data` du composant. Quand la requête charge, cette propriété est incrémentée de 1. Quand elle termine de charger, elle est décrémentée de 1. De cette façon, cette propriété peut servir de compteur des requêtes en cours.
- `watchLoading(isLoading, countModifier)` est un hook appelé lorsque l'état de chargement d'une requête change. Le paramètre `countModifier` est égal à `1` quand la requête charge, ou `-1` quand elle a terminé.
- `manual` est un booléen qui permet de désactiver les mises à jour automatiques des propriétés. Si vous l'utilisez, vous devez spécifier une fonction de retour `result` (voir l'exemple ci-dessous).
- `deep` est un booléen qui permet d'utiliser `deep: true` sur les observateurs Vue.
- `skip` est un booléen ou une fonction (réactive) qui retourne un booléen. La fonction reçoit le composant en cours et la clé d'une requête intelligente en arguments, pour pouvoir être utilisé dans `$query` et dans les `defaultOptions` d'`ApolloProvider`.
- `subscribeToMore`: un objet ou un tableau d'objets d'[options subscribeToMore](../guide/apollo/subscriptions.md#subscribetomore).
- `prefetch` est soit un booléen, soit une fonction qui détermine si une requête doit être pré-requêtée. Consultez [Rendu côté serveur (SSR)](../guide/ssr.md).
- Vous pouvez également utiliser n'importe quelle autre option `watchQuery` options (consultez [la documentation d'Apollo](https://www.apollographql.com/docs/react/api/apollo-client.html#ApolloClient.watchQuery)).

Exemple :

```js
// Options spécifiques à Apollo
apollo: {
  // Requête avancée avec des paramètres
  // La méthode 'variables' est observée par Vue
  pingMessage: {
    query: gql`query PingMessage($message: String!) {
      ping(message: $message)
    }`,
    // Paramètres réactifs
    variables () {
      // Utilisez des propriétés réactives Vue
      return {
        message: this.pingInput,
      }
    },
    // Variables : observation imbriquée
    deep: false,
    // On utilise une fonction de retour personnalisée car
    // les noms de champs ne correspondent pas
    // Par défaurt, l'attribut 'pingMessage'
    // serait utilisé sur l'objet de résultat 'data'
    // Ici, nous savons que le résultat est dans l'attribut 'ping'
    // sachant comment le serveur Apollo fonctionn
    update (data) {
      console.log(data)
      // La valeur retournée met à jour
      // la propriété Vue 'pingMessage'
      return data.ping
    },
    // Hook de résultat optionnel
    result ({ data, loading, networkStatus }) {
      console.log('Nous avons des résultats !')
    },
    // Gestion d'erreur
    error (error) {
      console.error('Nous avons une erreur !', error)
    },
    // État de chargement
    // loadingKey est le nom de la propriété
    // qui sera incrémentée quand la requête chargera
    // et décrémentée lorsqu'elle sera terminée.
    loadingKey: 'loadingQueriesCount',
    // watchLoading est appelé quand l'état de chargement change
    watchLoading (isLoading, countModifier) {
      // isLoading est un booléen
      // countModifier est soit 1 ou -1
    },
  },
},
```

Si vous utilisez `ES2015`, vous pouvez également écrire `update` de cette façon :

```js
update: data => data.ping
```

Exemple en mode manuel :

```js
{
  query: gql`...`,
  manual: true,
  result ({ data, loading }) {
    if (!loading) {
      this.items = data.items
    }
  },
}
```

## Propriétés

### Skip

Vous pouvez mettre `skip` en pause ou pas :

```js
this.$apollo.queries.users.skip = true
```

### loading

Si la requête est en cours :

```js
this.$apollo.queries.users.loading
```

## Méthodes

### refresh

Arrête et reprend la requête :

```js
this.$apollo.queries.users.refresh()
```

### start

Démarre la requête :

```js
this.$apollo.queries.users.start()
```

### stop

Arrête la requête :

```js
this.$apollo.queries.users.stop()
```

### fetchMore

Charge plus de données pour la pagination :

```js
this.page++

this.$apollo.queries.tagsPage.fetchMore({
  // Nouvelles variables
  variables: {
    page: this.page,
    pageSize,
  },
  // Transformation du résultat précédent avec de nouvelles données
  updateQuery: (previousResult, { fetchMoreResult }) => {
    const newTags = fetchMoreResult.tagsPage.tags
    const hasMore = fetchMoreResult.tagsPage.hasMore

    this.showMoreEnabled = hasMore

    return {
      tagsPage: {
        __typename: previousResult.tagsPage.__typename,
        // Union des tableaux de libellés
        tags: [...previousResult.tagsPage.tags, ...newTags],
        hasMore,
      },
    }
  },
})
```

### subscribeToMore

Souscrire à plus de data en utilisant des souscription GraphQL :

```js
// Nous devons nous désinscrire avant de souscrire à nouveau
if (this.tagsSub) {
  this.tagsSub.unsubscribe()
}
// Souscription dans la requête
this.tagsSub = this.$apollo.queries.tags.subscribeToMore({
  document: TAG_ADDED,
  variables: {
    type,
  },
  // Mutation du résultat précédent
  updateQuery: (previousResult, { subscriptionData }) => {
    // Si nous avons déjà ajouté le libellé, on ne fait rien
        // Cela peut être causé par `updateQuery` dans notre mutation addTag
    if (previousResult.tags.find(tag => tag.id === subscriptionData.data.tagAdded.id)) {
      return previousResult
    }

    return {
      tags: [
        ...previousResult.tags,
        // Ajout du nouveau libellé
        subscriptionData.data.tagAdded,
      ],
    }
  },
})
```

### refetch

Requête à nouveau, potentiellement avec de nouvelles variables :

```js
this.$apollo.queries.users.refetch()
// Avec de nouvelles variables
this.$apollo.queries.users.refetch({
  friendsOf: 'id-user'
})
```

### setVariables

Met à jour les variables de la requête et l'exécute à nouveau si elle a changé. Pour forcer une requête, vous pouvez utiliser `refetch`.

```js
this.$apollo.queries.users.setVariables({
  friendsOf: 'id-uset'
})
```

### setOptions

Met à jour les options Apollo [watchQuery](https://www.apollographql.com/docs/react/api/apollo-client/#ApolloClient.watchQuery) et requête à nouveau :

```js
this.$apollo.queries.users.setOptions({
  fetchPolicy: 'cache-and-network'
})
```

### startPolling

Commence une mise à jour automatique en utilisant le *polling* (en requêtant toutes les `x` millisecondes) :

```js
this.$apollo.queries.users.startPolling(2000) // millisecondes
```

### stopPolling

Arrêt du *polling* :

```js
this.$apollo.queries.users.stopPolling()
```
