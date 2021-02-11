# Clients multiples

Vous pouvez spécifier plusieurs client Apollo si votre application doit se connecter à différents serveurs GraphQL :

```js
const defaultOptions = {
  // Vous pouvez utiliser `wss` pour sécuriser la connexion (recommandé en production)
  // Utilisez `null` pour désactiver les souscriptions
  wsEndpoint: process.env.VUE_APP_GRAPHQL_WS || 'ws://localhost:4000/graphql',
  // Jeton LocalStorage
  tokenName: AUTH_TOKEN,
  // Activation des requêtes persistées automatiquement avec Apollo Engine
  persisting: false,
  // Utilisation générale des websockets (pas de requêtes HTTP)
  // Il vous faudra passer un `wsEndpoint` pour que ça fonctionne
  websocketsOnly: false,
  // Rendu côté serveur ?
  ssr: false,
}

const clientAOptions = {
  // Utilisez `https` pour sécuriser la connexion (recommandé en production)
  httpEndpoint: 'http://localhost:4000/graphql',
}

const clientBOptions = {
  httpEndpoint: 'http://example.org/graphql',
}

// Invoquez cette fonction dans votre fichier d'application Vue
export function createProvider (options = {}) {
  const createA= createApolloClient({
    ...defaultOptions,
    ...clientAOptions,
  });

  const createB = createApolloClient({
    ...defaultOptions,
    ...clientBOptions,
  });

  const a = createA.apolloClient;
  const b = createB.apolloClient;

  // Création du provider Vue Apollo
  const apolloProvider = new VueApollo({
    clients: {
      a,
      b
    }
    defaultClient: a,
})
```

Dans l'option `apollo` du composant, vous pouvez définir un client pour toutes vos requêtes, souscriptions, et mutations avec `$client` (uniquement pour ce composant) :

```js
export default {
  apollo: {
    $client: 'b',
  },
}
```

Vous pouvez également sp"cifier le client dans chaque requête, souscription et mutation grâce à l'option `client`:

```js
tags: {
  query: gql`...`,
  client: 'b',
}
```
