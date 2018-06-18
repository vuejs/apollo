# Mutations

Mutations are queries that change your data state on your apollo server. For more info, visit the [apollo doc](https://www.apollographql.com/docs/react/reference/index.html#ApolloClient\.mutate). There is a mutation-focused [example app](https://github.com/Akryum/vue-apollo-todos) you can look at.

**You shouldn't send the `__typename` fields in the variables, so it is not recommended to send an Apollo result object directly.**

```javascript
methods: {
  addTag() {
    // We save the user input in case of an error
    const newTag = this.newTag
    // We clear it early to give the UI a snappy feel
    this.newTag = ''
    // Call to the graphql mutation
    this.$apollo.mutate({
      // Query
      mutation: gql`mutation ($label: String!) {
        addTag(label: $label) {
          id
          label
        }
      }`,
      // Parameters
      variables: {
        label: newTag,
      },
      // Update the cache with the result
      // The query will be updated with the optimistic response
      // and then with the real result of the mutation
      update: (store, { data: { newTag } }) => {
        // Read the data from our cache for this query.
        const data = store.readQuery({ query: TAGS_QUERY })
        // Add our tag from the mutation to the end
        data.tags.push(newTag)
        // Write our data back to the cache.
        store.writeQuery({ query: TAGS_QUERY, data })
      },
      // Optimistic UI
      // Will be treated as a 'fake' result as soon as the request is made
      // so that the UI can react quickly and the user be happy
      optimisticResponse: {
        __typename: 'Mutation',
        addTag: {
          __typename: 'Tag',
          id: -1,
          label: newTag,
        },
      },
    }).then((data) => {
      // Result
      console.log(data)
    }).catch((error) => {
      // Error
      console.error(error)
      // We restore the initial user input
      this.newTag = newTag
    })
  },
},
```

Server-side:

```javascript
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

// Fake word generator
import faker from 'faker'

// Let's generate some tags
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