# Local state

## Why use Apollo local state management?

When you perform GraphQL queries with Apollo, the results of API calls will be stored in **Apollo cache**. Now imagine you also need to store some kind of a local application state and make it available for different components. Usually, in Vue application we can achieve this with [Vuex](https://vuex.vuejs.org/). But having both Apollo and Vuex will mean you store your data in two different places so you have _two sources of truth_.

Good thing is Apollo has a mechanism of storing local application data to cache. Previously, it used an [apollo-link-state](https://github.com/apollographql/apollo-link-state) library for this. Since Apollo 2.5 release this functionality was included to Apollo core.

## Creating a local schema

Just how creating a GraphQL schema is the first step toward defining our data model on the server, writing a local schema is the first step we take on the client.

Let's create a local schema to describe an item that will serve as a single element of todo-items list. This item should have some text, some property to define if it's already done or not and also an ID to distinguish one todo-item from another. So, it should be an object with three properties:

```js
{
  id: 'uniqueId',
  text: 'some text',
  done: false
}
```

Now we're ready to add an `Item` type to our local GraphQL schema.

```js
//main.js

import gql from 'graphql-tag';

export const typeDefs = gql`
  type Item {
    id: ID!
    text: String!
    done: Boolean!
  }
`;
```

`gql` here stands for the JavaScript template literal tag that parses GraphQL query strings.

Now we need to add `typeDefs` to our Apollo client

```js{4-5}
// main.js

const apolloClient = new ApolloClient({
  typeDefs,
  resolvers: {},
});
```

:::warning WARNING
As you can see, we've added also an empty `resolvers` object here: if we don't assign it to the Apollo client options, it won't recognize the queries to local state and will try to send a request to remote URL instead
:::

## Extending a remote GraphQL schema locally

You can not only create a local schema from scratch but also add a local **virtual fields** to your existing remote schema. These fields only exist on the client and are useful for decorating server data with local state.

Imagine we have a type `User` in our remote schema:

```js
type User {
  name: String!
  age: Int!
}
```

And we want to add a local-only property to `User`:

```js
export const schema = gql`
  extend type User {
    twitter: String
  }
`;
```

Now, when querying a user, we will need to specify `twitter` field is local:

```js
const userQuery = gql`
  user {
    name
    age
    twitter @client
  }
`;
```

## Initializing an Apollo cache

To initialize an Apollo cache in your application, you will need to use an `InMemoryCache` constructor. First, let's import it to your main file:

```js{4,6}
// main.js

import ApolloClient from 'apollo-boost';
import { InMemoryCache } from 'apollo-cache-inmemory';

const cache = new InMemoryCache();
```

Now we need to add cache to our Apollo client options:

```js{4}
//main.js

const apolloClient = new ApolloClient({
  cache,
  typeDefs,
  resolvers: {},
});
```

Right now the cache is empty. To add some initial data to the cache, we need to use `writeData` method:

```js{9-20}
// main.js

const apolloClient = new ApolloClient({
  cache,
  typeDefs,
  resolvers: {},
});

cache.writeData({
  data: {
    todoItems: [
      {
        __typename: 'Item',
        id: 'dqdBHJGgjgjg',
        text: 'test',
        done: true,
      },
    ],
  },
});
```

We've just added an array of `todoItems` to our cache data and we defined that every item has a type name of `Item` (specified in our local schema).

## Query local data

Querying local cache is very similar to [sending GraphQL queries to remote server](apollo/queries.md). First, we need to create a query:

```js
// App.vue

import gql from 'graphql-tag';

const todoItemsQuery = gql`
  {
    todoItems @client {
      id
      text
      done
    }
  }
`;
```

The main difference with queries to remote API is `@client` directive. This directive specifies that this query should not be executed against remote GraqhQL API. Instead, Apollo client should fetch results from the local cache.

Now, we can use this query in our Vue component as a usual Apollo query:

```js
// App.vue

apollo: {
  todoItems: {
    query: todoItemsQuery
  }
},
```

## Change local data with mutations

We have two different ways to change the local data:

- direct write with `writeData` method as we did during [cache initialization](#initializing-an-apollo-cache);
- calling a GraphQL mutation.

Let's add some mutations to our [local GraphQL schema](#creating-a-local-schema):

```js{10-14}
// main.js

export const typeDefs = gql`
  type Item {
    id: ID!
    text: String!
    done: Boolean!
  }

  type Mutation {
    checkItem(id: ID!): Boolean
    addItem(text: String!): Item
  }
`;
```

The `checkItem` mutation will set the Boolean `done` property of the certain item to the opposite. Let's create it using `gql`:

```js
// App.vue

const checkItemMutation = gql`
  mutation($id: ID!) {
    checkItem(id: $id) @client
  }
`;
```

We defined a _local_ mutation (because we have a `@client` directive here) that will accept a unique identifier as a parameter. Now, we need a _resolver_: a function that resolves a value for a type or field in a schema.

In our case, resolver will define what changes do we want to make to our local Apollo cache when we have a certain mutation. Local resolvers have the same function signature as remote resolvers (`(parent, args, context, info) => data`). In fact, we will need only args (arguments passed to the mutation) and context (we will need its cache property to read and write data).

Let's add a resolver to our main file:

```js
// main.js

const resolvers = {
  Mutation: {
    checkItem: (_, { id }, { cache }) => {
      const data = cache.readQuery({ query: todoItemsQuery });
      const currentItem = data.todoItems.find(item => item.id === id);
      currentItem.done = !currentItem.done;
      cache.writeQuery({ query: todoItemsQuery, data });
      return currentItem.done;
    },
};
```

What are we doing here?

1. read the `todoItemsQuery` from our cache to see what `todoItems` do we have now;
2. looking for an item with given id;
3. change found item `done` property to opposite;
4. write our changed `todoItems` back to cache;
5. return the `done` property as a mutation result.

Now we need to replace an empty `resolvers` object in Apollo client options with newly created `resolvers`:

```js{17}
// main.js

const resolvers = {
  Mutation: {
    checkItem: (_, { id }, { cache }) => {
      const data = cache.readQuery({ query: todoItemsQuery });
      const currentItem = data.todoItems.find(item => item.id === id);
      currentItem.done = !currentItem.done;
      cache.writeQuery({ query: todoItemsQuery, data });
      return currentItem.done;
    },
};

const apolloClient = new ApolloClient({
  cache,
  typeDefs,
  resolvers,
});
```

After this, we can use the mutation in our Vue component like normal [mutations](apollo/mutations.md)

```js
// App.vue

methods: {
  checkItem(id) {
    this.$apollo.mutate({
      mutation: checkItemMutation,
      variables: { id }
    });
  },
}
```
