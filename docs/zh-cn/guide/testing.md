# 测试

要为 vue-apollo 查询和变更创建单元测试，你可以选择简单测试或使用模拟 GraqhQL schema 进行测试。所有的示例都使用了 [Jest](https://jestjs.io/) 和 [vue-test-utils](https://github.com/vuejs/vue-test-utils)。

## 简单测试

对于简单的查询测试，你只需要设置组件数据并检查组件如何使用 Jest 快照功能进行渲染。比如说，如果你有一个展示所有 Vue 英雄的查询，你可以添加一个包含单个英雄的模拟数组：

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
对于简单的变更测试，你需要检查组件中是否调用了 `$apollo` 的 `mutate` 方法。接下来的示例在 `addHero` 方法中调用了变更：

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

## 使用模拟 GraqhQL schema 进行测试

你还可以使用 [模拟 GraphQL schema](https://www.apollographql.com/docs/graphql-tools/mocking.html) 进行更深入、更复杂的测试。这种方法并不包含 Apollo，但能够让你检查某些查询是否能够在给定的 schema 中正确执行。

为此，首先需要建立 schema：

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
下一步是使用 `graphql-tools` 方法创建可执行的 schema：

```js
import { makeExecutableSchema } from 'graphql-tools'
...
const schema = makeExecutableSchema({
  typeDefs: sourceSchema,
})
```
之后你需要向 schema 添加模拟函数：

```js
import { addMockFunctionsToSchema } from 'graphql-tools'
...
addMockFunctionsToSchema({
  schema,
})
```
指定 GraphQL 查询字符串：

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
在测试用例中调用 GraphQL 查询，保存响应到组件数据中，然后检查渲染完成的组件是否与快照匹配：

```js
graphql(schema, query).then(result => {
  wrapper.setData(result.data)
  expect(wrapper.element).toMatchSnapshot()
})
```
在这个用例中，所有字符串字段将等于 `Hello World` 且所有数值都将为负数。如果你想要获得更贴近现实的响应，则应当为某些查询指定解析器：

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
然后你需要将解析器添加到可执行 schema，并在添加模拟函数时将 `preserveResolvers` 属性设置为 true：

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
你可以用同样的方法来测试变更。

---