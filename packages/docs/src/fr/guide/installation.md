# Installation

## Plugin Vue CLI

J'ai créé un plugin pour [vue-cli](http://cli.vuejs.org) afin que vous puissiez ajouter Apollo (ainsi qu'un serveur GraphQL optionnel!) en deux minutes ! ✨🚀

Dans votre projet Vue CLI 3 :

```bash
vue add apollo
```

Ensuite, vous pouvz passer à la section suivante: [Premiers pas](./apollo/).

[Plus d'informations](https://github.com/Akryum/vue-cli-plugin-apollo)

## Manuel d'installation

### 1. Apollo Client

Vous pouvez utiliser soit [Apollo Boost](#apollo-boost), soit [Apollo Client directement](#apollo-client-full-configuration) (davantage de configuration).

#### Apollo Boost

Apollo Boost est une façon de commencer à utiliser Apollo Client sans rien avoir à configurer. Cela inclut des valeurs par défaut intéressantes, comme les dépendances `InMemoryCache` et `HttpLink` recommandées, pré-configurées avec nos paramètres recommandés. C'est parfait pour commencer rapidement.

Installez-le, ainsi que `vue-apollo` and `graphql`:

```
npm install --save vue-apollo graphql apollo-boost
```

Ou bien :

```
yarn add vue-apollo graphql apollo-boost
```

Dans votre application, créez une instance d'`ApolloClient` :

```js
import ApolloClient from 'apollo-boost'

const apolloClient = new ApolloClient({
  // Vous devez utiliser un URL absolu
  uri: 'https://api.graphcms.com/simple/v1/awesomeTalksClone'
})
```

#### Apollo Client et configuration complète

Si vous souhaitez plus de contrôle, installez ces packages à la place d'Apollo Boost :

```
npm install --save vue-apollo graphql apollo-client apollo-link apollo-link-http apollo-cache-inmemory graphql-tag
```

Ou bien :

```
yarn add vue-apollo graphql apollo-client apollo-link apollo-link-http apollo-cache-inmemory graphql-tag
```

Dans votre application, créez une instance d'`ApolloClient` :

```js
import { ApolloClient } from 'apollo-client'
import { createHttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'

// Connection HTTP à l'API
const httpLink = createHttpLink({
  // Vous devez utiliser un URL absolu
  uri: 'http://localhost:3020/graphql',
})

// Implémentation du cache
const cache = new InMemoryCache()

// Création du client Apollo
const apolloClient = new ApolloClient({
  link: httpLink,
  cache,
})
```

### 2. Installation du plugin dans Vue

```js
import Vue from 'vue'
import VueApollo from 'vue-apollo'

Vue.use(VueApollo)
```

### 3. Apollo provider

Le provider contient les instances du client Apollo qui peuvent ensuite être utilisés par tous les composants enfant.

```js
const apolloProvider = new VueApollo({
  defaultClient: apolloClient,
})
```

Ajoutez-le à votre application avec l'option `apolloProvider`:

```js
new Vue({
  el: '#app',
  // Injectez le provider Apollo, comme avec Vue Router ou Vuex
  apolloProvider,
  render: h => h(App),
})
```

Vous êtes maintenant prêt à utiliser Apollo dans vos composanst !

## Intégration dans l'IDE

### Visual Studio Code

Si vous utilisez VS Code, il est recommandé d'installer l'[extension Apollo GraphQL](https://marketplace.visualstudio.com/items?itemName=apollographql.vscode-apollo).

Ensuite, configurez-la en créant un fichier `apollo.config.js` à la racine de votre projet Vue:

```js
// apollo.config.js
module.exports = {
  client: {
    service: {
      name: 'my-app',
      // URL de l'API GraphQL
      url: 'http://localhost:3000/graphql',
    },
    // Fichiers traités par extension
    includes: [
      'src/**/*.vue',
      'src/**/*.js',
    ],
  },
}
```

### WebStorm

Si vous utilisez WebStorm, il est recommandé d'installer l'[extension JS GraphQL](https://plugins.jetbrains.com/plugin/8097-js-graphql/).

Ensuite, configurez-la en créant un fichier `.graphqlconfig` à la racine de votre projet Vue:

```graphqlconfig
{
  "name": "Untitled GraphQL Schema",
  "schemaPath": "./path/to/schema.graphql",
  "extensions": {
    "endpoints": {
      "Default GraphQL Endpoint": {
        "url": "http://url/to/the/graphql/api",
        "headers": {
          "user-agent": "JS GraphQL"
        },
        "introspect": false
      }
    }
  }
}
```
