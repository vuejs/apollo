# Setup

确保你已经 [安装了 Apollo Client](../guide/installation.md)。

## 1. 安装 @vue/apollo-composable

```shell
npm install --save @vue/apollo-composable
```

或：

```shell
yarn add @vue/apollo-composable
```

## 2. 连接 Apollo Client 到 Vue

你需要在根实例中提供一个默认的 Apollo Client 实例：

```js
import { DefaultApolloClient } from '@vue/apollo-composable'
import { provide } from 'vue'

const app = new Vue({
  setup() {
    provide(DefaultApolloClient, apolloClient)
  },

  render: h => h(App),
})
```

### 多客户端

你也可以提供为应用提供多个可用的 Apollo Client 实例。在这种情况下，建议提供一个 `default` 值：

```js
import { ApolloClients } from '@vue/apollo-composable'
import { provide } from 'vue'

const app = new Vue({
  setup() {
    provide(ApolloClients, {
      default: apolloClient,
    })
  },

  render: h => h(App),
})
```

你可以在旁边添加其他客户端实例：

```js
provide(ApolloClients, {
  default: apolloClient,
  clientA: apolloClientA,
  clientB: apolloClientB,
})
```

然后，你可以在函数中通过 `clientId` 选项来选择其中的一个使用（例如`useQuery`、`useMutation` 和 `useSubscription`）。
