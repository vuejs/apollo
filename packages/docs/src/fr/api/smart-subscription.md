# Souscription intelligente

Chaque souscription déclarée dans l'option `apollo.$subscribe` dans les résultats d'un composant génère la création d'iun objet de souscriptions intelligentes.

## Options

- `query`: document GraphQL (un fichier ou une chaîne `gql`).
- `variables`: un objet ou une fonction réactive qui retourne un objet. Chaque clé est mappée avec un `'$'` dans le document GraphQL, par exemple `foo` devient `$foo`.
- `throttle`: régule les mises à jour des variables (en millisecondes).
- `debounce`: stabilise les mises à jour des variables (en millisecondes).
- `result(data, key)` est un hook appelé lorsqu'un résultat est reçu
- `error(error)` est un hook appelé quand des erreurs surviennent. `error` est un objet d'erreur Apollo avec soit une propriété `graphQLErrors` ou bien une propriété `networkError`.
- `skip` est un booléen ou une fonction (réactive) qui retourne un booléen. La fonction reçoit le composant en cours et la clé d'une requête intelligente en arguments, pour pouvoir être utilisé dans `$query` et dans les `defaultOptions` d'`ApolloProvider`.

## Propriétés

### Skip

Vous pouvez mettre `skip` en pause ou pas :

```js
this.$apollo.subscriptions.users.skip = true
```

## Méthodes

### refresh

Arrête et reprend la requête :

```js
this.$apollo.subscriptions.users.refresh()
```

### start

Démarre la requête :

```js
this.$apollo.subscriptions.users.start()
```

### stop

Arrête la requête :

```js
this.$apollo.subscriptions.users.stop()
```
