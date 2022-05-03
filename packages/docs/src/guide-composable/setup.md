# Setup

Make sure you have [installed Apollo Client](../guide/installation.md).

## 1. Install @vue/apollo-composable

```shell
npm install --save @vue/apollo-composable
```

Or:

```shell
yarn add @vue/apollo-composable
```

## 2. Connect Apollo Client to Vue

### Vue 2

In your root instance, you need to provide a default Apollo Client instance:

```js
import { provide } from '@vue/composition-api'
import { DefaultApolloClient } from '@vue/apollo-composable'

const app = new Vue({
  setup () {
    provide(DefaultApolloClient, apolloClient)
  },

  render: h => h(App),
})
```

::: warning
In the rest of the guide, we will show code examples with Vue 3. If you need Vue 2, you might want to import the Composition API functions from `'@vue/composition-api'` instead of `'vue'`.
:::

### Vue 3

```js
import { createApp, provide, h } from 'vue'
import { DefaultApolloClient } from '@vue/apollo-composable'

const app = createApp({
  setup () {
    provide(DefaultApolloClient, apolloClient)
  },

  render: () => h(App),
})
```

### Multiple clients

You can also provide multiple Apollo Client instances to be used in your application. In this case, it's recommended to provide a `default` one:

```js
import { provide } from 'vue'
import { ApolloClients } from '@vue/apollo-composable'

const app = new Vue({
  setup () {
    provide(ApolloClients, {
      default: apolloClient,
    })
  },

  render: h => h(App),
})
```

You can add other client instances alongside it:

```js
provide(ApolloClients, {
  default: apolloClient,
  clientA: apolloClientA,
  clientB: apolloClientB,
})
```

You can then select which one to use in functions we will cover next (such as `useQuery`, `useMutation` and `useSubscription`) with the `clientId` option.

## Usage outside of setup

When using e.g. `useQuery` outside of vue contexts, the clients cannot be injected using vue's provide/inject mechanism. `@vue/apollo-composable` can manage their own apollo clients

Use `provideApolloClient` for a single default client:

```js
import { provideApolloClient } from "@vue/apollo-composable";

provideApolloClient(apolloClient)
```

Use `provideApolloClients` for multiple clients:

```js
import { provideApolloClients } from "@vue/apollo-composable";

provideApolloClients({
  default: apolloClient,
  clientA: apolloClientA,
  clientB: apolloClientB,
})
```
