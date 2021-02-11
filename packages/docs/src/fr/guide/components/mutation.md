# ApolloMutation

Vous pouvez utiliser le composant `ApolloMutation` (ou `apollo-mutation`) pour invoquer des mutations Apollo directement dans vos templates.

Voici un exemple :

```vue
<ApolloMutation
  :mutation="gql => gql`
    mutation DoStuff ($name: String!) {
      someWork (name: $name) {
        success
        timeSpent
      }
    }
  `"
  :variables="{
    name
  }"
  @done="onDone"
>
  <template v-slot="{ mutate, loading, error }">
    <button :disabled="loading" @click="mutate()">Cliquez ici</button>
    <p v-if="error">Une erreur s'est produite: {{ error }}</p>
  </template>
</ApolloMutation>
```

Consultez [ApolloQuery](./query.md) pour en savoir plus sur comment écrire des requêtes GraphQL dans le template.

Consultez [la référence API](../../api/apollo-subscribe-to-more.md) pour connaître toutes les options disponibles.

## Rafraîchir le cache

Si la mutation ne met à jour que des objets qui existent déjà en cache (par exemple, qui change des champs existants), vous n'avez pas besoin de faire quoi que ce soit, Apollo Client rafraîchira le cache automatiquement. Cela fonctionnera uniquement si l'objet dans le résultat de la mutation contient les champs `__typename` et `id` (ou les champs personnalisés que vous utilisez pour [normaliser le cache](https://www.apollographql.com/docs/react/advanced/caching#normalization)).

Sinon, vous devez dire à Apollo Client comment mettre le cache à jour avec le résultat de la mutation. Par exemple, si la mutation ajoute un nouvel élément, vous devez mettre à jour le résultat concerné pour pouvoir pousser ce nouvel élément dans la requête.

### Ajouter un élément

```vue
<template>
  <ApolloMutation
    :mutation="gql => gql`
      mutation ($input: SendMessageToThreadInput!) {
        sendMessageToThread (input: $input) {
          message {
            ...message
          }
        }
      }
      ${$options.fragments.message}
    `"
    :variables="{
      threadId,
      text
    }"
    :update="updateCache"
  >
    <!-- Formulaire -->
  </ApolloMutation>
</template>

<script>
import gql from 'gql-tag'

const fragments = {
  message: gql`
    fragment message on Message {
      id
      text
      user {
        id
        name
      }
    }
  `
}

export default {
  fragments,

  props: {
    threadId: {
      type: String,
      required: true
    }
  },

  methods: {
    updateCache (store, { data: { sendMessageToThread } }) {
      const query = {
        query: gql`
        query ($threadId: ID!) {
          thread (id: $threadId) {
            id
            messages {
              ...message
            }
          }
        }
        ${fragments.message}
        `,
        variables: {
          threadId: this.threadId,
        },
      }
      // Lecture de la requête depuis le cache
      const data = store.readQuery(query)
      // Mutation du résultat du cache
      data.thread.messages.push(sendMessageToThread.message)
      // Réécriture en cache
      store.writeQuery({
        ...query,
        data,
      })
    },
  }
}
</script>
```

### Retirer un élément

```vue
<template>
  <ApolloMutation
    :mutation="gql => gql`
      mutation ($input: DeleteMessageFromThreadInput!) {
        deleteMessageFromThread (input: $input) {
          success
        }
      }
    `"
    :variables="{
      threadId,
      messageId
    }"
    :update="updateCache"
  >
    <!-- Formulaire -->
  </ApolloMutation>
</template>

<script>
import gql from 'gql-tag'

const fragments = {
  message: gql`
    fragment message on Message {
      id
      text
      user {
        id
        name
      }
    }
  `
}

export default {
  fragments,

  props: {
    threadId: {
      type: String,
      required: true
    },
    messageId: {
      type: String,
      required: true
    }
  },

  methods: {
    updateCache (store, { data: { deleteMessageFromThread } }) {
      const query = {
        query: gql`
        query ($threadId: ID!) {
          thread (id: $threadId) {
            id
            messages {
              ...message
            }
          }
        }
        ${fragments.message}
        `,
        variables: {
          threadId: this.threadId,
        },
      }
      // Lecture de la requête depuis le cache
      const data = store.readQuery(query)
      // Recherche de l'élément supprimé
      const index = data.thread.messages.findIndex(m => m.id === this.messageId)
      if (index !== -1) {
        // Mutation du résultat du cache
        data.thread.messages.splice(index, 1)
        // Réécriture en cache
        store.writeQuery({
          ...query,
          data,
        })
      }
    },
  }
}
</script>
```
