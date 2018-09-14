# Mutations

Las "Mutations" son consultas que cambian el estado de su data en su servidor apollo.

Use `this.$apollo.mutate()` para enviar una mutation de GraphQL.

Para mayor información, visite la [documentación de apollo](https://www.apollographql.com/docs/react/api/apollo-client.html#ApolloClient.mutate). Allí encontrara una [app de ejemplo](https://github.com/Akryum/vue-apollo-todos) para mayores detalles.

::: warning
No debe enviar los campos `__typename` en las variables, por lo cual no es recomendado enviar un "result object" directamente.
:::

```js
methods: {
  addTag() {
    // Guardar el input del usuario en caso de algún error
    const newTag = this.newTag
    // Clear para una mejor experiencia de UI
    this.newTag = ''
    // LLamar a la mutation 
    this.$apollo.mutate({
      // Consulta
      mutation: gql`mutation ($label: String!) {
        addTag(label: $label) {
          id
          label
        }
      }`,
      // Parametros
      variables: {
        label: newTag,
      },
      // Actualizar cache con resultado
      // La consulta se actualiza con la respuesta optimista
      // y luego con el resultado real de la mutatiom
      update: (store, { data: { newTag } }) => {
        // Lee la data desde la cache para esta consulta.
        const data = store.readQuery({ query: TAGS_QUERY })
        // Agregamos la etiqueta
        data.tags.push(newTag)
        // Escribimos la data nueva en cache.
        store.writeQuery({ query: TAGS_QUERY, data })
      },
      // Optimistic UI
      // Será tratado como un resultado "falso" tan pronto como se haga un request
      // Para que la UI reaccione con rapidez y el usuario sea felíz
      optimisticResponse: {
        __typename: 'Mutation',
        addTag: {
          __typename: 'Tag',
          id: -1,
          label: newTag,
        },
      },
    }).then((data) => {
      // Resultado
      console.log(data)
    }).catch((error) => {
      // Error
      console.error(error)
      // Se restaura el input inicial del usuario
      this.newTag = newTag
    })
  },
},
```

## Ejemplo Server-side 

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

// Generador de palabras "falsas"
import faker from 'faker'

// Generemos etiquetas
var id = 0
var tags = []
for (let i = 0; i < 42; i++) {
  addTag(faker.random.word())
}

function addTag(label) {
  let t = {
    id: id++,
    label,
  }
  tags.push(t)
  return t
}

export const resolvers = {
  Query: {
    tags(root, args, context) {
      return tags
    },
  },
  Mutation: {
    addTag(root, { label }, context) {
      console.log(`adding tag '${label}'`)
      return addTag(label)
    },
  },
}
```
