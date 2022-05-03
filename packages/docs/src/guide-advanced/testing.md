# Testing

::: danger Outdated
This guide is outdated and needs rework for Vue 3 and vue-apollo 4. Contributions welcome!
:::

To create unit tests for vue-apollo queries and mutations you can choose either a simple testing or tests with mocked GraqhQL schema. All examples here use [Jest](https://jestjs.io/) and [vue-test-utils](https://github.com/vuejs/vue-test-utils)

## Simple tests

For simple query testing you can just set the components data and check how component renders with a Jest snapshot feature. Say, if you have a query to display all Vue heroes, you can add a mocked array with a single hero:

```js
test('displayed heroes correctly with query data', () => {
  const wrapper = shallowMount(App, { localVue })
  wrapper.setData({
    allHeroes: [
      {
        id: 'some-id',
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
For simple mutation test you need to check if `$apollo` method `mutate` is called in your component. In the next example mutation was called in the `addHero` method:

```js
test('called Apollo mutation in addHero() method', () => {
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

## Tests with mocked GraqhQL schema

You can also make some more deep and complicated tests with [mocked GraphQL schema](https://www.apollographql.com/docs/graphql-tools/mocking.html). This method doesn't include Apollo, but lets you check if certain query will be executed correctly with given schema.

To do so, first you need the schema:

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
Next step is to create an executable schema with `graphql-tools` method:

```js
import { makeExecutableSchema } from 'graphql-tools'
...
const schema = makeExecutableSchema({
  typeDefs: sourceSchema,
})
```
After this you need to add mock functions to schema:

```js
import { addMockFunctionsToSchema } from 'graphql-tools'
...
addMockFunctionsToSchema({
  schema,
})
```
Specify the GraphQL query string:

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
Call GraphQL query in the test case, save response to component data and then check if rendered component matches a snapshot:

```js
graphql(schema, query).then(result => {
  wrapper.setData(result.data)
  expect(wrapper.element).toMatchSnapshot()
})
```
In this case all string fields will be equal to `Hello World` and all number values will be negative. If you want to have more real-life response, you should specify resolvers for certain queries:

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
Then you need to add resolvers to executable schema and set `preserveResolvers` property to true when adding mock functions:

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
You can test mutations in the same way.

---