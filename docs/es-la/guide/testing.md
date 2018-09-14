# Testing

Para crear unit tests para consultas(queries) y mutations de vue-apollo puede escoger test simples o tests que simulen un esquema de graphQL. Todos los ejemplos citados usan [Jest](https://jestjs.io/) y [vue-test-utils](https://github.com/vuejs/vue-test-utils)

## Simple tests

Para una test simple, puede \ establecer los datos de los componentes y verificar cómo se representan los componentes con la funcionabilidad de snapshots de Jest. Digamos, si tiene una consulta para mostrar todos los héroes de Vue, puede agregar un mock de un array con un solo héroe:

```js
test('displayed heroes correctly with query data', () => {
    const wrapper = shallowMount(App, { localVue });
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
    });
    expect(wrapper.element).toMatchSnapshot();
});
```
Para un mutation test simple es necesario comprobar si el método `$apollo`  `mutate`  es llamado en su componente. En el siguiente ejemplo, se llamó a la mutation en el método `addHero`:

```js
test('called Apollo mutation in addHero() method', () => {
  const mutate = jest.fn();
  const wrapper = mount(App, {
    localVue,
    mocks: {
      $apollo: {
        mutate,
      },
    },
  });
  wrapper.vm.addHero();
  expect(mutate).toBeCalled();
});
```

## Tests con esquemas simulados de GraqhQL

También puedes hacer algunas pruebas más profundas y complicadas con [mocked GraphQL schema](https://www.apollographql.com/docs/graphql-tools/mocking.html). Este método no incluye Apollo, pero le permite verificar si cierta consulta se ejecutará correctamente con el esquema dado.

Para ello, primero es necesario el esquema:

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
`;
```
El siguiente paso es crear un esquema ejecutable con el método `graphql-tools`:

```js
import { makeExecutableSchema } from 'graphql-tools';
...
const schema = makeExecutableSchema({
  typeDefs: sourceSchema,
});
```
Después de esto, necesita agregar funciones simuladas al esquema:

```js
import { addMockFunctionsToSchema } from 'graphql-tools';
...
addMockFunctionsToSchema({
  schema,
});
```
Especifique el string de la consulta GraphQL:

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
`;
```
Llame a la consulta GraphQL en el test case, guarde la respuesta a la data del componente y luego verifique si el componente renderizado concuerda con un snapshot:

```js
graphql(schema, query).then(result => {
  wrapper.setData(result.data);
  expect(wrapper.element).toMatchSnapshot();
});
```
En este caso, todos los campos del string serán iguales a `Hello World` y todos los valores numéricos serán negativos. Si desea tener más respuesta en la vida real, debe especificar los resolvers para ciertas consultas:

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
};
```
Luego, debe agregar `resolvers` al esquema ejecutable y establecer la propiedad `preserveResolvers` en `true` cuando agregue funciones simuladas:

```js
const schema = makeExecutableSchema({
  typeDefs: sourceSchema,
  resolvers,
});

addMockFunctionsToSchema({
  schema,
  preserveResolvers: true,
});
```
Se pueden testear mutations de la misma manera

---