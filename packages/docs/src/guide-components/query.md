# ApolloQuery

You can use the `ApolloQuery` (or `apollo-query`) component to have watched Apollo queries directly in your template. 
After reading this page, see the [API Reference](../api/apollo-query.md) for all the possible options.

## Query gql tag

This is the recommended way of using the `ApolloQuery` component. It uses the same syntax with the `gql` tag like in the other examples:

```vue
<template>
  <ApolloQuery
    :query="gql => gql`
      query MyHelloQuery ($name: String!) {
        hello (name: $name)
      }
    `"
    :variables="{ name }"
  >
    <!-- TODO -->
  </ApolloQuery>
</template>
```

We are passing a function to the `query` prop that gets the `gql` tag as argument, so we can write the GraphQL document directly.

The above example also features `variables` passed to the query using the prop with the same name.

Inside the default slot of `ApolloQuery`, you can access various slot data about the watched query, like the `result` object:

```vue
<template v-slot="{ result: { loading, error, data } }">
  <!-- Loading -->
  <div v-if="loading" class="loading apollo">Loading...</div>

  <!-- Error -->
  <div v-else-if="error" class="error apollo">An error occurred</div>

  <!-- Result -->
  <div v-else-if="data" class="result apollo">{{ data.hello }}</div>

  <!-- No result -->
  <div v-else class="no-result apollo">No result :(</div>
</template>
```

Here is the complete example component:

```vue
<script>
export default {
  data () {
    return {
      name: 'Anne'
    }
  }
}
</script>

<template>
  <div>
    <input v-model="name" placeholder="Enter your name">

    <ApolloQuery
      :query="gql => gql`
        query MyHelloQuery ($name: String!) {
          hello (name: $name)
        }
      `"
      :variables="{ name }"
    >
      <template v-slot="{ result: { loading, error, data } }">
        <!-- Loading -->
        <div v-if="loading" class="loading apollo">Loading...</div>

        <!-- Error -->
        <div v-else-if="error" class="error apollo">An error occurred</div>

        <!-- Result -->
        <div v-else-if="data" class="result apollo">{{ data.hello }}</div>

        <!-- No result -->
        <div v-else class="no-result apollo">No result :(</div>
      </template>
    </ApolloQuery>
  </div>
</template>
```

### Tag setup

If you are not using [vue-cli-plugin-apollo](https://github.com/Akryum/vue-cli-plugin-apollo) (`v0.20.0+`), you need to configure [vue-loader](https://vue-loader.vuejs.org) to transpile the string template tag. `vue-loader` uses [Bublé](https://buble.surge.sh/guide/) under-the-hood to transpile code inside component templates. We need to add the `dangerousTaggedTemplateString` transform to Bublé for `gql` to work. For example, with Vue CLI:

```js
// vue.config.js

module.exports = {
  chainWebpack: config => {
    config.module
      .rule('vue')
      .use('vue-loader')
        .loader('vue-loader')
        .tap(options => {
          options.transpileOptions = {
            transforms: {
              dangerousTaggedTemplateString: true,
            },
          }
          return options
        })
  }
}
```

In a raw Webpack configuration, it would look like this:

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: [
          {
            loader: 'vue-loader',
            options: {
              transpileOptions: {
                transforms: {
                  dangerousTaggedTemplateString: true
                }
              }
            }
          }
        ]
      },

      /* Other rules ... */
    ]
  }
}
```

## Query with gql files

An alternative way of using the component is by creating separate `.gql` files. Those files need pre-processing with [graphql-tag](https://github.com/apollographql/graphql-tag#webpack-preprocessing-with-graphql-tagloader).

```vue
<template>
  <ApolloQuery
    :query="require('../graphql/HelloWorld.gql')"
    :variables="{ name }"
  >
    <template v-slot="{ result: { loading, error, data } }">
      <!-- Loading -->
      <div v-if="loading" class="loading apollo">Loading...</div>

      <!-- Error -->
      <div v-else-if="error" class="error apollo">An error occurred</div>

      <!-- Result -->
      <div v-else-if="data" class="result apollo">{{ data.hello }}</div>

      <!-- No result -->
      <div v-else class="no-result apollo">No result :(</div>
    </template>
  </ApolloQuery>
</template>
```

## Query operations

You can access the smart query object with the `query` slot prop. Here is an example component paginating data with `fetchMore`:

```vue
<template>
  <ApolloQuery
    :query="/* query */"
    :variables="{
      limit: $options.pageSize
    }"
    v-slot="{ result: { loading, error, data }, query }"
  >
    <!-- Display data here -->
    <button v-if="hasMore" @click="loadMore(query)">Load more</button>
  </ApolloQuery>
</template>

<script>
export default {
  pageSize: 10,

  data: {
    return {
      page: 1,
      hasMore: true
    }
  },

  methods: {
    async loadMore (query) {
      await query.fetchMore({
        variables: {
          offset: this.page++ * this.$options.pageSize
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult || fetchMoreResult.product.length === 0) {
            this.hasMore = false
            return prev
          }
          return Object.assign({}, prev, {
            product: [...prev.product, ...fetchMoreResult.product]
          })
        }
      })
    }
  }
}
</script>
```

See the [API reference](../api/smart-query.md#methods) for all possible smart query methods.

## Using fragments

Fragments are useful to share parts of GraphQL documents in other documents to retrieve the same data consistently and also to not copy-paste code.

Let's say we have this `GetMessages` query with a `messages` field that is an array of `Message` objects:

```graphql
query GetMessages {
  messages {
    id
    user {
      id
      name
    }
    text
    created
  }
}
```

We want to extract all the fields in `messages` of the `Message` type into a fragment, so we can reuse it elsewhere.

First import the `gql` tag in the component:

```js
import gql from 'graphql-tag'
```

Then, inside the component definition, declare a new `fragments` object:

```js
export default {
  fragments: {
    /** TODO */
  }
}
```

Here is what the `message` fragment, which is applied on the `Message` type, looks like:

```graphql
fragment message on Message {
  id
  user {
    id
    name
  }
  text
  created
}
```

We can use the `gql` tag just like we do for queries:

```js
export default {
  fragments: {
    message: gql`
      fragment message on Message {
        id
        user {
          id
          name
        }
        text
        created
      }
    `
  }
}
```

Inside our component, we can now access the fragment with `this.$options.fragments.message`. To use the fragment in our `GetMessages` query, we need to use the GraphQL `...` spread operator and also put the fragment alongside the query:

```js
gql`
  query GetMessages {
    messages {
      ...message
    }
  }
  ${$options.fragments.message}
`
```

Which will effectively produce this GraphQL document (that you can try on the GraphQL playground of your API):

```graphql
query GetMessages {
  messages {
    ...message
  }
}
fragment message on Message {
  id
  user {
    id
    name
  }
  text
  created
}
```

So what's happening here? GraphQL will find the `...` operator where we usually select fields in the `messages` field inside our query. The `...` operator is followed by the name of the fragment, `message`, which then looked up the whole GraphQL document. Here we have correctly defined the fragment, so it's found just under the query. Finally, GraphQL will copy all the fragment content and replace `...message` with it.

In the end, we obtain the final query:

```graphql
query GetMessages {
  messages {
    id
    user {
      id
      name
    }
    text
    created
  }
}
fragment message on Message {
  id
  user {
    id
    name
  }
  text
  created
}
```

Here is the full example component:

```vue
<!-- MessageList.vue -->
<script>
import gql from 'graphql-tag'

export default {
  fragments: {
    message: gql`
      fragment message on Message {
        id
        user {
          id
          name
        }
        text
        created
      }
    `
  }
}
</script>

<template>
  <ApolloQuery
    :query="gql => gql`
      query GetMessages {
        messages {
          ...message
        }
      }
      ${$options.fragments.message}
    `"
  >
    <!-- Content... -->
  </ApolloQuery>
</template>
```

### Reusing the fragment

Now we can retrieve the `message` fragment in another component:

```vue
<!-- MessageForm.vue -->
<script>
import gql from 'graphql-tag'
import MessageList from './MessageList.vue'

export default {
  methods: {
    async sendMessage () {
      await this.$apollo.mutate({
        mutation: gql`
          mutation SendMessage ($input: SendMessageInput!) {
            addMessage (input: $input) {
              newMessage {
                ...message
              }
            }
          }
          ${MessageList.fragments.message}
        `,
        variables: {
          /* variables here */
        },
        /* other options here */
      })
    }
  }
}
</script>
```
