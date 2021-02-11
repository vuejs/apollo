# ApolloProvider

## Constructeur

```js
const apolloProvider = new VueApollo({
  // Support de plusieurs clients
  // Utilise l'option 'client' dans les requêtes
  // ou bien '$client' sur la définition Apollo
  clients: {
    a: apolloClientA,
    b: apolloClientB,
  },
  // Client par défaut
  defaultClient: apolloClient,
  // Défition 'apollo' par défaut
  defaultOptions: {
    // Consultez la définition 'apollo'
    // Par exemple : les options de requête par défaut
    $query: {
      loadingKey: 'loading',
      fetchPolicy: 'cache-and-network',
    },
  },
  // Observation de l'état de chargement pour toutes les requêtes
  // Consultez 'Requêtes intelligentes > options > watchLoading' pour plus de détails
  watchLoading (isLoading, countModifier) {
    loading += countModifier
    console.log('Global loading', loading, countModifier)
  },
  // Gestion globale des erreurs pour toutes les requêtes intelligentes et les souscriptions
  errorHandler (error) {
    console.log('Gestion globale des erreurs')
    console.error(error)
  },
  // Désactivation globale de la pré-requête lors du rendu côté serveur (SSR)
  prefetch: Boolean,
})
```

Vous pouvez utiliser le provider Apollo dans votre application Vue :

```js
new Vue({
  el: '#app',
  apolloProvider,
  render: h => h(App),
})
```
