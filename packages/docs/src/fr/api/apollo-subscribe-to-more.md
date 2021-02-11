# Composant ApolloSubscribeToMore

Exemple :

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
      // Le résultat précédent est immutable
      const newResult = {
        messages: [...previousResult.messages],
      }
      // Ajoute la question au tableau
      newResult.messages.push(subscriptionData.data.messageAdded)
      return newResult
    },
  },
}
</script>
```

## Props

- `document`: un document GraphQL qui contient la souscription ou une fonction qui reçoit le gabarit `gql` en argument et doit retourner le document transformé.
- `variables`: un objet qui met automatiquement à jour les variables de souscription.
- `updateQuery`: une fonction qui met à jour le résultat de requête si nécessaire.
