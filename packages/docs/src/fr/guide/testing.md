# Tests

Pour tester unitairement vos requêtes et vos mutations Vue Apollo, vous pouvez faire des tests simples, ou bien tester avec un schéma GraphQL mocké. Tous les exemples documentés utilisent [Jest](https://jestjs.io/) et [vue-test-utils](https://github.com/vuejs/vue-test-utils).

## Tests simples

Pour tester une requête, vous pouvez simplement assigner de la donnée au composant et rgarder comment il est rendu grâce aux snapshots Jest. Imaginons que vous ayez une requête pour récupérer les héros de Vue, vous pouvez ajouter une fausse liste avec un seul héros :

```js
test('affiche les héros correctement avec la donnée requêtée', () => {
  const wrapper = shallowMount(App, { localVue })
  wrapper.setData({
    allHeroes: [
      {
        id: 'un-identifiant',
        name: 'Evan You',
        image: 'https://pbs.twimg.com/profile_images/888432310504370176/mhoGA4uj_400x400.jpg',
        twitter: 'youyuxi',
        github: 'yyx990803',
      },
    ],
  })
  expect(wrapper.element).toMatchSnapshot()
})
```

Pour un simple test de mutation, vous devez vérifier que la méthode `mutate` d'`$apollo` a été appelée dans votre composant. Dans l'exemple qui suit, la mutation a été appelée dans la méthode `addHero` :

```js
test('appelle la mutation Apollo dans la méthode `addHero`', () => {
  const mutate = jest.fn()
  const wrapper = mount(App, {
    localVue,
    mocks: {
      $apollo: {
        mutate,
      },
    },
  })
  wrapper.vm.addHero()
  expect(mutate).toBeCalled()
})
```

### Tester l'état de chargement en mockant `$apollo`

Si vous souhaitez tester ce que votre composant affiche lorsque les résultats de votre requête GraphQL sont encore en train de charger, vous pouvez également mocker un état de chargement dans les requêtes Apollo respctives :

```js
test('s\'affiche correctement lorsque allHeroes sont en train de charger', () => {
  const wrapper = mount(App, {
    mocks: {
      $apollo: {
        queries: {
          allHeroes: {
            loading: true,
          },
        },
      },
    },
  })

  expect(wrapper.element).toMatchSnapshot();
})
```

## Tester avec un schéma GraphQL mocké

Vous pouvez également faire des tests plus complexes et plus en profondeur grâce à [un schéma GraphQL mocké](https://www.apollographql.com/docs/graphql-tools/mocking.html). Cette méthode n'inclut pas Apollo, mais vous laisse vérifier qu'une requête s'exécute correctement avec un schéma donné.

Pour cela, vous avez d'abord besoin d'un schéma :

```js
const sourceSchema = `
  type VueHero {
    id: ID!
    name: String!
    image: String
    github: String
    twitter: String
  }

  input HeroInput {
    name: String!
    image: String
    github: String
    twitter: String
  }


  type Query {
    allHeroes: [VueHero]
  }

  type Mutation {
    addHero(hero: HeroInput!): VueHero!
    deleteHero(name: String!): Boolean
  }
`
```

Ensuite, il vous faut créer un schéma exécutable avec la méthode `graphql-tools` :

```js
import { makeExecutableSchema } from 'graphql-tools'

// ...

const schema = makeExecutableSchema({
  typeDefs: sourceSchema,
})
```

Puis vous devez ajouter les fonctions mockées au schéma :

```js
import { addMockFunctionsToSchema } from 'graphql-tools'

// ...

addMockFunctionsToSchema({
  schema,
})
```

Spcéfiez la requête GraphQL :

```js
const query = `
  query {
    allHeroes {
      id
      name
      twitter
      github
      image
    }
  }
`
```

Appelez la requête GraphQL dans le test, passez la réponse comme donnée au composant, puis vérifiez que le rendu du composant correspond au snapshot :

```js
graphql(schema, query).then(result => {
  wrapper.setData(result.data)
  expect(wrapper.element).toMatchSnapshot()
})
```

Dans ce cas, tous les champs de types `string` seront égales à "Hello World" et tous ceux de type `number` seront négatifs. Si vous souhaitez une réponse plus réaliste, vous devez spécifier les résolveurs pour chaque requête :

```js
const resolvers = {
  Query: {
    allHeroes: () => [
      {
        id: '-pBE1JAyz',
        name: 'Evan You',
        image:
          'https://pbs.twimg.com/profile_images/888432310504370176/mhoGA4uj_400x400.jpg',
        twitter: 'youyuxi',
        github: 'yyx990803',
      },
    ],
  },
}
```

Ensuite, vous devez ajouter des résolveurs à votre schéma exécutable et assigner la propriété `preserveResolvers` à `true` lorsque vous ajoutez les fonctions mockées :

```js
const schema = makeExecutableSchema({
  typeDefs: sourceSchema,
  resolvers,
})

addMockFunctionsToSchema({
  schema,
  preserveResolvers: true,
})
```

Vous pouvez tester les mutations de la même façon.

---