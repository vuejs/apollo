# Souscriptions

## Installation

*Pour l'implémentation serveur, vous ppuvez jeter un œil à [cet exemple simple](https://github.com/Akryum/apollo-server-example).*

Pour activer la souscription par websockets, vous devez configurer un peu plus de choses :

```
npm install --save apollo-link-ws apollo-utilities
```

```js
import Vue from 'vue'
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
// Nouveaux imports
import { split } from 'apollo-link'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'

import VueApollo from 'vue-apollo'

const httpLink = new HttpLink({
  // Vous devez utiliser un URL absolu
  uri: 'http://localhost:3020/graphql',
})

// Création du lien de souscription websocket
const wsLink = new WebSocketLink({
  uri: 'ws://localhost:3000/subscriptions',
  options: {
    reconnect: true,
  },
})

// Grâce à la possibilité de scinder les liens, vous pouvez envoyer de la donnée
// à chaque lien, en fonction du type d'opération à envoyer
const link = split(
  // Scission en fonction du type d'opération
  ({ query }) => {
    const definition = getMainDefinition(query)
    return definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
  },
  wsLink,
  httpLink
)

// Création du client Apollo
const apolloClient = new ApolloClient({
  link,
  cache: new InMemoryCache(),
  connectToDevTools: true,
})

// Installation du plugin Vue comme précédemment
Vue.use(VueApollo)
```

## Souscriptions supplémentaires

Si vous souhaitez mettre à jour une requête intelligente depuis une souscription, la meilleure façon est d'utiliser la méthode de requête intelligente `subscribeToMore`. Cela crée des [souscriptions intelligentes](../../api/smart-subscription.md) liées à votre requête intelligente. Ajoutez simplement `subscribeToMore` à votre requête intelligente :

```js
apollo: {
  tags: {
    query: TAGS_QUERY,
    subscribeToMore: {
      document: gql`subscription name($param: String!) {
        itemAdded(param: $param) {
          id
          label
        }
      }`,
      // Variables passées à la souscription
      // Comme nous utilisons une fonction, elles sont réactives
      variables () {
        return {
          param: this.param,
        }
      },
      // Mutation du résultat précédent
      updateQuery: (previousResult, { subscriptionData }) => {
        // On retourne le nouveau résultat depuis le précédent,
        // avec la nouvelle donnée
      },
    }
  }
}
```

::: tip
Notez qu'il est possible de passer un tableau de souscriptions à `subscribeToMore` pour souscrire à plusieurs souscriptions dans une requête.
:::

### Utilisation alternative

Vous pouvez accéder aux requêtes que vous avez définies dans l'option `apollo` avec `this.$apollo.queries.<name>`, ce qui ressemblerait à ceci :

```js
this.$apollo.queries.tags.subscribeToMore({
  // Document GraphQL
  document: gql`subscription name($param: String!) {
    itemAdded(param: $param) {
      id
      label
    }
  }`,
  // Variables passées à la souscription
  variables: {
    param: '42',
  },
  // Mutation du résultat précédent
  updateQuery: (previousResult, { subscriptionData }) => {
    // On retourne le nouveau résultat depuis le précédent
    // avec la nouvelle donnée
  },
})
```

Si la requête concernée est arrêtée, la souscription est automatiquement détruite.

Voici un exemple :

```js
// Souscription au document GraphQL
const TAG_ADDED = gql`subscription tags($type: String!) {
  tagAdded(type: $type) {
    id
    label
    type
  }
}`

// Libellés SubscribeToMore
// Nous avons plusieurs types de libellés
// avec une souscription 'channl' pour chaque
this.$watch(() => this.type, (type, oldType) => {
  if (type !== oldType || !this.tagsSub) {
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
  }
}, {
  immediate: true,
})
```

## Abstraction simple

::: danger
Si vous souhaitez mettre à jour une requête avec le résultat d'une souscription, utilisez `subscribeToMore`.
Les méthodes ci-dessous s'appliquent dans le cas d'une notification.
:::

Vous pouvez déclarer des [souscriptions intelligentes](../../api/smart-subscription.md) dans l'option `apollo` avec le mot-clé `$subscribe` :

```js
apollo: {
  // Souscriptions
  $subscribe: {
    // Lorsqu'un libellé est ajouté
    tagAdded: {
      query: gql`subscription tags($type: String!) {
        tagAdded(type: $type) {
          id
          label
          type
        }
      }`,
      // Variables réactives
      variables () {
        // Le fonctionnement est le même que pour des requêtes classiques
        // et souscrit à nouveau avec les bonnes variables
        // chaque fois qu'un valeur change
        return {
          type: this.type,
        }
      },
      // Hook de résultat
      // N'oubliez pas de décomposer `data`
      result ({ data }) {
        console.log(data.tagAdded)
      },
    },
  },
},
```

Vous pouvez accéder à la souscription avec `this.$apollo.subscriptions.<name>`.

:::tip
Comme pour les requêtes, vous pouvez déclarer la souscription [avec une fonction](./queries.md#option-function), et vous pouvez déclarer l'option `query` [avec une fonction réactive](./queries.md#reactive-query-definition).
:::

Lorsqu'un serveur supporte les requêtes en temps réel et utilise les souscriptions pour les mettre à jour, comme [Hasura](https://hasura.io/), vous pouvez utiliser de simples souscriptions pour les requêtes réactives :

```js
data () {
  return {
    tags: [],
  };
},
apollo: {
  $subscribe: {
    tags: {
      query: gql`subscription {
        tags {
          id
          label
          type
        }
      }`,
      result ({ data }) {
        this.tags = data.tags;
      },
    },
  },
},
```

## Sauter la souscription

Si la souscription est sautée, elle est désactivée et ne sera plus mise à jour. Vous pouvez utiliser l'options `skip` :

```js
// Options spécifiques à Apollo
apollo: {
  // Souscriptions
  $subscribe: {
    // Lorsqu'un libellé est ajouté
    tags: {
      query: gql`subscription tags($type: String!) {
        tagAdded(type: $type) {
          id
          label
          type
        }
      }`,
      // Variables réactives
      variables () {
        return {
          type: this.type,
        }
      },
      // Hook de résultat
      result (data) {
        // Mise à jour de l'état local
        this.tags.push(data.tagAdded)
      },
      // On saute la souscription
      // Skip the subscription
      skip () {
        return this.skipSubscription
      }
    },
  },
},
```

Ici, `skip` est appelé automatiquement dès que la propriété `skipSubscription` du composant change.

Vous pouvez aussi accéder à la souscription directemnt et assigner la propriété `skip` :

```js
this.$apollo.subscriptions.tags.skip = true
```

## Ajouter des souscription intelligentes manuellement

Vous pouvez ajouter manellement une souscription intelligente avec la méthode `$apollo.addSmartSubscription(key, options)` :

```js
created () {
  this.$apollo.addSmartSubscription('tagAdded', {
    // Mêmes options que pour '$subscribe' ci-dessus
  })
}
```

:::tip
En interne, cette méthode est appelée pour chaque entrée de l'objet `$subscribe` dans l'option `apollo` du composant.
:::

## Souscription Apollo standard

Utilisez la méthode `$apollo.subscribe()` pour souscrire à une souscription GraphQL qui sera automatiquement détruite lors que le composant le sera également. Cela ne crée **pas** de souscription intelligente.

```js
mounted () {
  const subQuery = gql`subscription tags($type: String!) {
    tagAdded(type: $type) {
      id
      label
      type
    }
  }`

  const observer = this.$apollo.subscribe({
    query: subQuery,
    variables: {
      type: 'City',
    },
  })

  observer.subscribe({
    next (data) {
      console.log(data)
    },
    error (error) {
      console.error(error)
    },
  })
},
```
