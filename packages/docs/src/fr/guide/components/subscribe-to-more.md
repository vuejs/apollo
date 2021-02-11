# ApolloSubscribeToMore

Vous pouvez souscrire à davantage de donnée avec le composant `ApolloSubscribeToMore` (ou `apollo-subscribe-to-more`). Vous pouvez en utiliser autant que vous voulez dans un composant `<ApolloQuery>`.

::: tip
Si la mise à jour est liée à un objet existant (par exemple, changer la valeur d'un champ), `updateQuery` n'est pas requis, puisque le client Apollo sera capable de mettre le cache à jour automatiquement.
:::

Voici un exemple :

```vue
<template>
  <ApolloQuery :query="...">
    <ApolloSubscribeToMore
      :document="gql => gql`
        subscription messageChanged ($channelId: ID!) {
          messageAdded (channelId: $channelId) {
            type
            message {
              id
              text
            }
          }
        }
      `"
      :variables="{ channelId }"
      :updateQuery="onMessageAdded"
    />

    <!-- ... -->
  </ApolloQuery>
</template>

<script>
export default {
  data () {
    return {
      channel: 'general',
    }
  },

  methods: {
    onMessageAdded (previousResult, { subscriptionData }) {
      // Le résultat précédent est immuable
      const newResult = {
        messages: [...previousResult.messages],
      }
      // Ajoute la question dans la liste
      newResult.messages.push(subscriptionData.data.messageAdded)
      return newResult
    },
  },
}
</script>
```

Consultez [ApolloQuery](./query.md) pour en savoir plus sur comment écrire des requêtes GraphQL dans le template.

Consultez [la référence API](../../api/apollo-subscribe-to-more.md) pour connaître toutes les options disponibles.

## Exemples avec `updateQuery`

Ajouter un nouvel élément en cache :

```js
methods: {
  onMessageAdded (previousResult, { subscriptionData }) {
    // Le résultat précédent est immuable
    const newResult = {
      messages: [...previousResult.messages],
    }
    // Ajout la question dans la liste
    newResult.messages.push(subscriptionData.data.messageAdded)
    return newResult
  }
}
```

Retirer un élément du cache :

```js
methods: {
  onMessageAdded (previousResult, { subscriptionData }) {
    const removedMessage = subscriptionData.data.messageRemoved
    const index = previousResult.messages.findIndex(
      m => m.id === removedMessage.id
    )

    if (index === -1) return previousResult

    // Le résultat précédent est immuable
    const newResult = {
      messages: [...previousResult.messages],
    }
    // Retire la question de la liste
    newResult.messages.splice(index, 1)
    return newResult
  }
}
```
