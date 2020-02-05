# Rendu côté serveur (SSR)

::: warning
**Nécessite Vue 2.6+ avec `serverPrefetch`**
:::

## Plugin Vue CLI

J'ai créé un plugin pour [vue-cli](http://cli.vuejs.org) afin que vous puissiez ajouter Apollo (ainsi qu'un serveur GraphQL optionnel!) en deux minutes ! ✨🚀

Dans votre projet Vue CLI 3 :


```bash
vue add @akryum/ssr
```

[Plus d'informations](https://github.com/Akryum/vue-cli-plugin-ssr)

## Récupération de component

::: tip
Suivez le [guide SSR officiel](https://ssr.vuejs.org) pour en savoir plus sur le rendu côté serveur avec Vue.
:::

Par défaut, avez `vue-server-renderer`, toutes les requêtes GraphQL de vos composant rendus côté serveur sont pré-récupérées automatiquement.

::: tip
Vous avec accès à `this` dans les options telles que `variables`, même côté serveur !
:::

Example :

```js
export default {
  apollo: {
    allPosts: {
      query: gql`query AllPosts {
        allPosts {
          id
          imageUrl
          description
        }
      }`,
    }
  }
}
```

Example 2 :

```js
export default {
  apollo: {
    post: {
      query: gql`query Post($id: ID!) {
        post (id: $id) {
          id
          imageUrl
          description
        }
      }`,
      variables () {
        return {
          id: this.id,
        }
      },
    }
  }
}
```

## Sauter la pré-récupération de données

Vous pouvez ne pas pré-récupérer de données côté serveur pour une requête spécifique en assignant l'option `prefetch` à `false`.

Voici un exemple qui ne pré-récupère pas la requête :

```js{12}
export default {
  apollo: {
    allPosts: {
      query: gql`query AllPosts {
        allPosts {
          id
          imageUrl
          description
        }
      }`,
      // Pas de pré-récupération
      prefetch: false,
    }
  }
}
```

Si vous souhaitez ne pas pré-récupérer de données pour toutes les requêtes, vous pouvez utiliser l'option `$prefetch` option :

```js{4}
export default {
  apollo: {
    // Pas de pré-récupération
    $prefetch: false,
    allPosts: {
      query: gql`query AllPosts {
        allPosts {
          id
          imageUrl
          description
        }
      }`,
    }
  }
}
```

## Créer le client Apollo

Il est recommandé de créer les clients Apollo dans une fonction prenant un argument `ssr`, assigné à `true` côté serveur et `false` côté client.

Lorsque `ssr` est `false`, nous essayons de récupérer l'état du cache Apollo avec `cache.restore`, en récupérant la variable `window.__APOLLO_STATE__` qui est injectée dans le fichier HTML sur le serveur lors du rendu.

Voici un exemple :

```js{21-30}
// apollo.js

import Vue from 'vue'
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import VueApollo from 'vue-apollo'

// Installation du plugin Vue
Vue.use(VueApollo)

// Création du client Apollo
export function createApolloClient (ssr = false) {
  const httpLink = new HttpLink({
  // Vous devez utiliser un URL absolu
    uri: ENDPOINT + '/graphql',
  })

  const cache = new InMemoryCache()

  // Côté client, on récupère l'état injecté
  if (!ssr) {
    if (typeof window !== 'undefined') {
      const state = window.__APOLLO_STATE__
      if (state) {
        // Si vous utilisez plusieurs clients, utilisez `state.<client_id>`
        cache.restore(state.defaultClient)
      }
    }
  }

  const apolloClient = new ApolloClient({
    link: httpLink,
    cache,
    ...(ssr ? {
      // On active cette option côté serveur pour optimiser les requêtes lors du SSR
      ssrMode: true,
    } : {
      // Désactivation temporaire de la récupération forcée de requêtes
      ssrForceFetchDelay: 100,
    }),
  })

  return apolloClient
}
```

## Création de l'application

AU lieu de créer notre instance Vue racine tout de suite, nous utilisons une fonction `createApp` qui accepte un paramètre `context`.

Cette fonction est utilisée côté client et côté serveur avec une valeur `ssr` différente dans le `context`. Nous utilisons cette valeur dans la méthode `createApolloClient` que nous avons écrite plus tôt.

Voici un exemple d'une fonction `createApp` classique :

```js{9,37}
// app.js

import Vue from 'vue'
import VueRouter from 'vue-router'
import Vuex from 'vuex'
import { sync } from 'vuex-router-sync'

import VueApollo from 'vue-apollo'
import { createApolloClient } from './apollo'

import App from './ui/App.vue'
import routes from './routes'
import storeOptions from './store'

Vue.use(VueRouter)
Vue.use(Vuex)

function createApp (context) {
  const router = new VueRouter({
    mode: 'history',
    routes,
  })

  const store = new Vuex.Store(storeOptions)

  // On synchronise  le router avec le store Vuex
  // Cela enregistre `store.state.route`
  sync(store, router)

  // Restauration de l'état Vuex
  if (!context.ssr && window.__INITIAL_STATE__) {
    // On initialise l'état du store avec la donnée injectée depuis le serveur
    store.replaceState(window.__INITIAL_STATE__)
  }

  // Apollo
  const apolloClient = createApolloClient(context.ssr)
  const apolloProvider = new VueApollo({
    defaultClient: apolloClient,
  })

  return {
    app: new Vue({
      el: '#app',
      router,
      store,
      apolloProvider,
      ...App,
    }),
    router,
    store,
    apolloProvider,
  }
}

export default createApp
```

## Côté client


La partie client est simple -- on appelle `createApp` avec `ssr` passé à `false` :

```js
// client-entry.js

import createApp from './app'

createApp({
  ssr: false,
})
```

## Côté serveur

Nous n'avons besoin de rien faire de particulier, à part de stocker le cache Apollo pour pouvoir l'injecter dans le HTML du client. Vous pouvez trouver plus d'informations sur [le routage côté serveur](https://ssr.vuejs.org/guide/routing.html#routing-with-vue-router) et la [pré-récupération de données](https://ssr.vuejs.org/guide/data.html#data-store) dans le guide SSR officiel.

Voici un exemple avec Vue Router et un store Vuex :

```js{3,26}
// server-entry.js

import ApolloSSR from 'vue-apollo/ssr'
import createApp from './app'

export default () => new Promise((resolve, reject) => {
  const { app, router, store, apolloProvider } = createApp({
    ssr: true,
  })

  // Ajout de l'emplacement du routeur
  router.push(context.url)

  // On attend que le routeur ait résolu les possibles hooks asynchrones
  router.onReady(() => {
    // Ce hook `rendered` est appelé lorsque l'application est rendue
    context.rendered = () => {
      // Un fois l'application rendue, notre store est maintenant
      // rempli avec l'état de nos composants.
      // Lorsque nous attachons un état au contexte et que l'option `template`
      // est utilisée comme moteur de rendu, l'état est automatiquement
      // sérialisé et injecté dans le HTML dans `window.__INITIAL_STATE__`.
      context.state = store.state

      // On injecte également l'état du cache Apollo
      context.apolloState = ApolloSSR.getStates(apolloProvider)
    }
    resolve(app)
  })
})
```

Vous pouvez utiliser la méthode [ApolloSSR.getStates](../api/ssr.md#getstates) pour récupérer le code JavaScript nécessaire à l'injection dans la page générée pour passer la donnée du cache Apollo au client.

Dans le [template de page](https://ssr.vuejs.org/guide/#using-a-page-template), utilisez l'utilitaire `renderState` :

```html
{{{ renderState({ contextKey: 'apolloState', windowKey: '__APOLLO_STATE__' }) }}}
```

Voici un exemple complet :

```html{15}
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <link rel="icon" href="<%= BASE_URL %>favicon.ico">
    <title>{{ title }}</title>
    {{{ renderResourceHints() }}}
    {{{ renderStyles() }}}
  </head>
  <body>
    <!--vue-ssr-outlet-->
    {{{ renderState() }}}
    {{{ renderState({ contextKey: 'apolloState', windowKey: '__APOLLO_STATE__' }) }}}
    {{{ renderScripts() }}}
  </body>
</html>
```
