# Mutations

Les mutations sont des requêtes qui changent l'état de vos données sur votre serveur Apollo.

Pour envoyer une mutation GraphQL, il faut utiliser `this.$apollo.mutate()`.

Il existe une [application d'exemple](https://github.com/Akryum/vue-apollo-todos) focalisée sur les mutations que vopus pouvez consulter.

::: warning
Il n'est pas recommandé d'envoyer les champs `__typename` dans les variables, il faut donc éviter d'envoyer les réponses Apollo directement.
:::

```js
methods: {
  addTag() {
    // On sauvegarde l'entrée utilisateur en cas d'erreur
    const newTag = this.newTag
    // On la supprime tôt pour donner une sensation de réactivité à l'interface utilisateur
    this.newTag = ''
    // Appel à la mutation GraphQL
    this.$apollo.mutate({
      // Requête
      mutation: gql`mutation ($label: String!) {
        addTag(label: $label) {
          id
          label
        }
      }`,
      // Paramètres
      variables: {
        label: newTag,
      },
      // Mise à jour du cache avec le résultat
      // La requête sera mise à jour avec une réponse optimiste
      // puis avec le résultat de la mutation
      update: (store, { data: { addTag } }) => {
        // Lecture de la donnée depuis le cache pour cette requête
        const { tags } = store.readQuery({ query: TAGS_QUERY })
        // Ajout du libellé de la mutation en fin de tableau
        const tagsCopy = tags.slice()
        tagsCopy.push(addTag)
        // Réécriture en cache
        store.writeQuery({ query: TAGS_QUERY, { tags: tagsCopy }})
      },
      // Interface utilisateur optimiste
      // Utilisé comme "fausse" donnée dès qu'une requête est réalisée afin que
      // l'interface réagisse rapidement, pour une meilleur expérience
      optimisticResponse: {
        __typename: 'Mutation',
        addTag: {
          __typename: 'Tag',
          id: -1,
          label: newTag,
        },
      },
    }).then((data) => {
      // Résultat
      console.log(data)
    }).catch((error) => {
      // Erreur
      console.error(error)
      // On restaure l'entrée utilisateur initiale
      this.newTag = newTag
    })
  },
},
```

## Exemple côté serveur

```js
export const schema = `
type Tag {
  id: Int
  label: String
}

type Query {
  tags: [Tag]
}

type Mutation {
  addTag(label: String!): Tag
}

schema {
  query: Query
  mutation: Mutation
}
`

// Faux générateur de mots
import faker from 'faker'

// Générons quelques libellés
var id = 0
var tags = []
for (let i = 0; i < 42; i++) {
  addTag(faker.random.word())
}

function addTag (label) {
  let t = {
    id: id++,
    label,
  }
  tags.push(t)
  return t
}

export const resolvers = {
  Query: {
    tags (root, args, context) {
      return tags
    },
  },
  Mutation: {
    addTag (root, { label }, context) {
      console.log(`adding tag '${label}'`)
      return addTag(label)
    },
  },
}
```
