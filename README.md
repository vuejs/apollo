# Apollo in Vue

Integrates [apollo](http://www.apollostack.com/) in your vue components with declarative queries.

[Apollo "hello world" app](https://github.com/Akryum/frontpage-vue-app)

## Table of contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Usage in components](#usage-in-components)
- [Queries](#queries)
  - [Simple query](#simple-query)
  - [Query with parameters](#query-with-parameters)
  - [Reactive parameters](#reactive-parameters)
  - [Advanced options](#advanced-options)
  - [Reactive Query Example](#reactive-query-example)
- [Mutations](#mutations)
- [Subscriptions](#subscriptions)
- [Pagination with `fetchMore`](#pagination-with-fetchmore)

## Installation


    npm install --save vue-apollo apollo-client

## Configuration

```javascript
import Vue from 'vue';
import ApolloClient, { createNetworkInterface } from 'apollo-client';
import VueApollo from 'vue-apollo';

// Create the apollo client
const apolloClient = new ApolloClient({
  networkInterface: createNetworkInterface({
    uri: 'http://localhost:8080/graphql',
    transportBatching: true,
  }),
});

// Install the vue plugin
Vue.use(VueApollo, {
  apolloClient,
});

// Your Vue app is now Apollo-enabled!
```

## Usage in components

To declare apollo queries in your Vue component, add an `apollo` object :

```javascript
new Vue({
    apollo: {
        // Apollo specific options
    },
});
```

You can access the [apollo-client](http://dev.apollodata.com/core/apollo-client-api.html) instance with `this.$apollo.client` in all your vue components.

## Queries

In the `apollo` object, add an attribute for each property you want to feed with the result of an Apollo query.

### Simple query

Use `gql` to write your GraphQL queries:

```javascript
import gql from 'graphql-tag';
```

Put the [gql](http://docs.apollostack.com/apollo-client/core.html#gql) query directly as the value:

```javascript
apollo: {
  // Simple query that will update the 'hello' vue property
  hello: gql`{hello}`,
},
```

You can then access the subscription `ObservableQuery` object with `this.$apollo.queries.<name>`.

You can initialize the property in your vue component's `data` hook:

```javascript
data () {
  return {
    // Initialize your apollo data
    hello: '',
  },
},
```

Or with the `ES2015` syntax:

```javascript
data: () => ({
  // Initialize your apollo data
  hello: '',
}),
```

Server-side, add the corresponding schema and resolver:

```javascript
export const schema = `
type Query {
  hello: String
}

schema {
  query: Query
}
`;

export const resolvers = {
  Query: {
    hello(root, args, context) {
      return "Hello world!";
    },
  },
};
```

For more info, visit the [apollo doc](http://dev.apollodata.com/tools/).

You can then use your property as usual in your vue component:

```html
<template>
  <div class="apollo">
    <h3>Hello</h3>
    <p>
      {{hello}}
    </p>
  </div>
</template>
```

### Query with parameters

You can add variables (read parameters) to your `gql` query by declaring `query` and `variables` in an object:

```javascript
// Apollo-specific options
apollo: {
  // Query with parameters
  ping: {
    // gql query
    query: gql`query PingMessage($message: String!) {
      ping(message: $message)
    }`,
    // Static parameters
    variables: {
      message: 'Meow',
    },
  },
},
```

You can use the apollo `watchQuery` options in the object, like:
 - `forceFetch`
 - `fragments`
 - `returnPartialData`
 - `pollInterval`
 - ...

See the [apollo doc](http://dev.apollodata.com/core/apollo-client-api.html#ApolloClient\.watchQuery) for more details.

For example, you could add the `forceFetch` apollo option like this:

```javascript
apollo: {
  // Query with parameters
  ping: {
    query: gql`query PingMessage($message: String!) {
      ping(message: $message)
    }`,
    variables: {
      message: 'Meow'
    },
    // Additional options here
    forceFetch: true,
  },
},
```

Again, you can initialize your property in your vue component:

```javascript
data () {
  return {
    // Initialize your apollo data
    ping: '',
  };
},
```

Or with the `ES2015` syntax:

```javascript
data: () => ({
  // Initialize your apollo data
  ping: '',
}),
```

Server-side, add the corresponding schema and resolver:

```javascript
export const schema = `
type Query {
  ping(message: String!): String
}

schema {
  query: Query
}
`;

export const resolvers = {
  Query: {
    ping(root, { message }, context) {
      return `Answering ${message}`;
    },
  },
};
```

And then use it in your vue component:

```html
<template>
  <div class="apollo">
    <h3>Ping</h3>
    <p>
      {{ping}}
    </p>
  </div>
</template>
```

### Reactive parameters

Use a function instead to make the parameters reactive with vue properties:

```javascript
// Apollo-specific options
apollo: {
  // Query with parameters
  ping: {
    query: gql`query PingMessage($message: String!) {
      ping(message: $message)
    }`,
    // Reactive parameters
    variables() {
      // Use vue reactive properties here
      return {
          message: this.pingInput,
      };
    },
  },
},
```

This will re-fetch the query each time a parameter changes, for example:

```html
<template>
  <div class="apollo">
    <h3>Ping</h3>
    <input v-model="pingInput" placeholder="Enter a message" />
    <p>
      {{ping}}
    </p>
  </div>
</template>
```

### Advanced options

These are the available advanced options you can use:
- `update(data) {return ...}` to customize the value that is set in the vue property, for example if the field names don't match.
- `result(data)` is a hook called when a result is received.
- `error(error)` is a hook called when there are errors, `error` being an Apollo error object with either a `graphQLErrors` property or a `networkError` property.
- `loadingKey` will update the component data property you pass as the value. You should initialize this property to `0` in the component `data()` hook. When the query is loading, this property will be incremented by 1 and as soon as it no longer is, the property will be decremented by 1. That way, the property can represent a counter of currently loading queries.
- `watchLoading(isLoading, countModifier)` is a hook called when the loading state of the query changes. The `countModifier` parameter is either equal to `1` when the query is now loading, or `-1` when the query is no longer loading.


```javascript
// Apollo-specific options
apollo: {
  // Advanced query with parameters
  // The 'variables' method is watched by vue
  pingMessage: {
    query: gql`query PingMessage($message: String!) {
      ping(message: $message)
    }`,
    // Reactive parameters
    variables() {
      // Use vue reactive properties here
      return {
          message: this.pingInput,
      };
    },
    // We use a custom update callback because
    // the field names don't match
    // By default, the 'pingMessage' attribute
    // would be used on the 'data' result object
    // Here we know the result is in the 'ping' attribute
    // considering the way the apollo server works
    update(data) {
      console.log(data);
      // The returned value will update
      // the vue property 'pingMessage'
      return data.ping;
    },
    // Optional result hook
    result(data) {
      console.log("We got some result!");
    },
    // Error handling
    error(error) {
      console.error('We\'ve got an error!', error);
    },
    // Loading state
    // loadingKey is the name of the data property
    // that will be incremented when the query is loading
    // and decremented when it no longer is.
    loadingKey: 'loadingQueriesCount',
    // watchLoading will be called whenever the loading state changes
    watchLoading(isLoading, countModifier) {
      // isLoading is a boolean
      // countModifier is either 1 or -1
    },
  },
},
```

If you use `ES2015`, you can also write the `update` like this:

```javascript
update: data => data.ping
```

### Reactive Query Example

Here is a reactive query example using polling:

```javascript
// Apollo-specific options
apollo: {
  // 'tags' data property on vue instance
  tags: {
    query: gql`query tagList {
      tags {
        id,
        label
      }
    }`,
    pollInterval: 300, // ms
  },
},
```

Here is how the server-side looks like:

```javascript
export const schema = `
type Tag {
  id: Int
  label: String
}

type Query {
  tags: [Tag]
}

schema {
  query: Query
}
`;

// Fake word generator
import casual from 'casual';

// Let's generate some tags
var id = 0;
var tags = [];
for (let i = 0; i < 42; i++) {
  addTag(casual.word);
}

function addTag(label) {
  let t = {
    id: id++,
    label,
  };
  tags.push(t);
  return t;
}

export const resolvers = {
  Query: {
    tags(root, args, context) {
      return tags;
    },
  },
};
```

## Mutations

Mutations are queries that changes your data state on your apollo server. For more info, visit the [apollo doc](http://dev.apollodata.com/core/apollo-client-api.html#ApolloClient\.mutate).

```javascript
methods: {
  addTag() {
    // We save the user input in case of an error
    const newTag = this.newTag;
    // We clear it early to give the UI a snappy feel
    this.newTag = '';
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
      // 'tagList' is the name of the query declared before
      // that will be updated with the optimistic response
      // and the result of the mutation
      updateQueries: {
        tagList: (previousQueryResult, { mutationResult }) => {
          // We incorporate any received result (either optimistic or real)
          // into the 'tagList' query we set up earlier
          return {
            tags: [...previousQueryResult.tags, mutationResult.data.addTag],
          };
        },
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
      console.log(data);
    }).catch((error) => {
      // Error
      console.error(error);
      // We restore the initial user input
      this.newTag = newTag;
    });
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
`;

// Fake word generator
import faker from 'faker';

// Let's generate some tags
var id = 0;
var tags = [];
for (let i = 0; i < 42; i++) {
  addTag(faker.random.word());
}

function addTag(label) {
  let t = {
    id: id++,
    label,
  };
  tags.push(t);
  return t;
}

export const resolvers = {
  Query: {
    tags(root, args, context) {
      return tags;
    },
  },
  Mutation: {
    addTag(root, { label }, context) {
      console.log(`adding tag '${label}'`);
      return addTag(label);
    },
  },
};
```

## Subscriptions

To make enable the websocket-based subscription, a bit of additional setup is required:

```javascript
import Vue from 'vue'
import ApolloClient, { createNetworkInterface } from 'apollo-client';
// New Imports
import { Client } from 'subscriptions-transport-ws';
import VueApollo, { addGraphQLSubscriptions } from 'vue-apollo';

// Create the network interface
const networkInterface = createNetworkInterface({
  uri: 'http://localhost:3000/graphql',
  transportBatching: true,
});

// Create the subscription websocket client
const wsClient = new Client('ws://localhost:3030');

// Extend the network interface with the subscription client
const networkInterfaceWithSubscriptions = addGraphQLSubscriptions(
  networkInterface,
  wsClient,
);

// Create the apollo client with the new network interface
const apolloClient = new ApolloClient({
  networkInterface: networkInterfaceWithSubscriptions,
});

// Install the plugin like before
Vue.use(VueApollo, {
  apolloClient,
});

// Your app is now subscription-ready!

import App from './App.vue'

new Vue({
  el: '#app',
  render: h => h(App)
});

```

Use the `$apollo.subscribe()` method to subscribe to a GraphQL subscription that will get killed automatically when the component is destroyed:

```javascript
mounted() {
  const subQuery = gql`subscription tags($type: String!) {
    tagAdded(type: $type) {
      id
      label
      type
    }
  }`;

  const observer = this.$apollo.subscribe({
    query: subQuery,
    variables: {
      type: 'City',
    },
  });

  observer.subscribe({
    next(data) {
      console.log(data);
    },
    error(error) {
      console.error(error);
    },
  });
},
```

You can declare subscriptions in the `apollo` option with the `subscribe` keyword:

```javascript
apollo: {
  // Subscriptions
  subscribe: {
    // When a tag is added
    tags: {
      query: gql`subscription tags($type: String!) {
        tagAdded(type: $type) {
          id
          label
          type
        }
      }`,
      // Reactive variables
      variables() {
        // This works just like regular queries
        // and will re-subscribe with the right variables
        // each time the values change
        return {
          type: this.type,
        };
      },
      // Result hook
      result(data) {
        console.log(data);
        // Let's update the local data
        this.tags.push(data.tagAdded);
      },
    },
  },
},
```

You can then access the subscription `ObservableQuery` object with `this.$apollo.subscriptions.<name>`.

For the server implementation, you can take a look at [this simple example](https://github.com/Akryum/apollo-server-example).

## Pagination with `fetchMore`

Use the `fetchMore()` method on the query:

```javascript
<template>
  <div id="app">
    <h2>Pagination</h2>
    <div class="tag-list" v-if="tagsPage">
      <div class="tag-list-item" v-for="tag in tagsPage.tags">
        {{ tag.id }} - {{ tag.label }} - {{ tag.type }}
      </div>
      <div class="actions">
        <button v-if="showMoreEnabled" @click="showMore">Show more</button>
      </div>
    </div>
  </div>
</template>

<script>
import gql from 'graphql-tag';

const pageSize = 10;

export default {
  name: 'app',
  data: () => ({
    page: 0,
    showMoreEnabled: true,
  }),
  apollo: {
    // Pages
    tagsPage: {
      // GraphQL Query
      query: gql`query tagsPage ($page: Int!, $pageSize: Int!) {
        tagsPage(page: $page, size: $pageSize) {
          tags {
            id
            label
            type
          }
          hasMore
        }
      }`,
      // Initial variables
      variables: {
        page: 0,
        pageSize,
      },
    },
  },
  methods: {
    showMore() {
      this.page ++;
      // Fetch more data and transform the original result
      this.$apollo.queries.tagsPage.fetchMore({
        // New variables
        variables: {
          page: this.page,
          pageSize,
        },
        // Transform the previous result with new data
        updateQuery: (previousResult, { fetchMoreResult }) => {
          const newTags = fetchMoreResult.data.tagsPage.tags;
          const hasMore = fetchMoreResult.data.tagsPage.hasMore;

          this.showMoreEnabled = hasMore;

          return {
            tagsPage: {
              // Merging the tag list
              tags: [...previousResult.tagsPage.tags, ...newTags],
              hasMore,
            },
          };
        },
      });
    },
  },
};
</script>
```

[Here](https://github.com/Akryum/apollo-server-example/blob/master/schema.js#L21) is a simple example for the server.

---

LICENCE ISC - Created by Guillaume CHAU (@Akryum)
