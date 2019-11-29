# Setup

Make sure you have [installed Apollo Client](../guide/installation.md).

## 1. Install @vue/apollo-composable

```
npm install --save @vue/apollo-composable
```

Or:

```
yarn add @vue/apollo-composable
```

## 2. Connect Apollo Client to Vue

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

### Multiple clients

You can also provide multiple Apollo Client instances to be used in your application. In this case, it's recommended to provide a `default` one:

```js
import { provide } from '@vue/composition-api'
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

You can add other client instances alongside:

```js
provide(ApolloClients, {
  default: apolloClient,
  clientA: apolloClientA,
  clientB: apolloClientB,
})
```
