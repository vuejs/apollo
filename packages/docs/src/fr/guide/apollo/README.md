# Utilisation dans des composants Vue

Après avoir installé `vue-apollo` dans votre application, tous vos composants peuvent utiliser Apollo via l'option spéciale `apollo`.

## Options `apollo`

Pour déclarer des requêtes Apollo dans vos composants Vue, ajouter l'objet `apollo` dans les options du composant :

```js
new Vue({
  apollo: {
    // Options spécifiques Apollo
  },
})
```

Dans un fichier `.vue` :

```vue
<template>
  <div>Mon composant</div>
</template>

<script>
export default {
  apollo: {
    // Options Vue Apollo
  }
}
</script>
```

## `$apollo`

Tous les composants enfant d'un composant possédant l'option `apolloProvider` ont un utilitaire `$apollo` de disponible. C'est le lien entre le composant et Apollo, il gère toute la complexité à votre place (y compris les mises à jours et le nettoyage).

Vous pouvez accéder aux instances [apollo-client](https://www.apollographql.com/docs/react/) avec `this.$apollo.provider.defaultClient` ou bien `this.$apollo.provider.clients.<key>` (pour [les clients multiple](../multiple-clients.md)) dans tous vos composants Vue.

Si vous êtes curieux, consultez [l'API d'$apollo](../../api/dollar-apollo.md).

## Requêtes

Dans l'objet `apollo`, ajoutez un attribut pour chaque propriété à laquelle vous voulez fournir le résultat d'une requête Apollo.

```vue
<template>
  <div>{{ hello }}</div>
</template>

<script>
import gql from 'graphql-tag'

export default {
  apollo: {
    // Une requête simple qui rafraîchit la propriété Vue 'hello'
    hello: gql`query {
      hello
    }`,
  },
}
</script>
```

Pour en savoir plus, consultez la [section Requêtes](./queries.md).

## Mutations

Utilisez `this.$apollo.mutate` pour envoyer des mutations :

```js
methods: {
  async addTag() {
    // Appel à la mutation GraphQL
    const result = await this.$apollo.mutate({
      // Requête
      mutation: gql`mutation ($label: String!) {
        addTag(label: $label) {
          id
          label
        }
      }`,
      // Paramètres
      variables: {
        label: this.newTag,
      },
    })
  }
}
```

Pour en savoir plus, consultez la [section Mutations](./mutations.md).

## Options spéciales

Les options spéciales commencent par un `$` dans l'objet `apollo`.

Pour en savoir plus, consultez la [section Options spéciales](./special-options.md).
