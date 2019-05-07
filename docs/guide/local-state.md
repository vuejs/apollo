# Local state

## Why use Apollo local state management?

When you perform GraphQL queries with Apollo, the results of API calls will be stored in **Apollo cache**. Now imagine you also need to store some kind of a local application state and make it available for different components. Usually, in Vue application we can achieve this with [Vuex](TODO). But having both Apollo and Vuex will mean you store your data in two different places so you have _two sources of truth_.

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

_TODO_

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

## Query local data from Apollo cache
