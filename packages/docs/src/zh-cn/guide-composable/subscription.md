# 订阅

除了使用查询来获取数据和使用变更来修改数据之外，GraphQL 规范还支持第三种操作类型，称为 `subscription`。

GraphQL 订阅是一种将数据从服务器推送到选择侦听服务器实时消息的客户端的方式。订阅与查询相似，因为它们指定了一组要传递给客户端的字段，但不是立即返回一个单一的答案，而是在服务端每次发生特定事件时发送一个结果。

订阅的一个常见用例是向客户端通知特定事件，例如创建新对象、更新字段等。

## 概览

GraphQL 订阅必须在 schema 中定义，就像查询和变更一样：

```graphql
type Subscription {
  messageAdded(channelId: ID!): Message!
}
```

在客户端，订阅查询看起来与任何其他类型的操作一样：

```graphql
subscription onMessageAdded($channelId: ID!) {
  messageAdded(channelId: $channelId) {
    id
    text
  }
}
```

发送给客户端的响应如下所示：

```json
{
  "data": {
    "messageAdded": {
      "id": "123",
      "text": "Hello!"
    }
  }
}
```

在上面的示例中，服务端被编写成当每次为特定频道添加消息时发送新结果。请注意，上面的代码仅定义了 schema 中的 GraphQL 订阅。阅读[在客户端设置订阅](#客户端设置)和[为服务器设置 GraphQL 订阅](https://www.apollographql.com/docs/graphql-subscriptions)以了解如何将订阅添加到你的应用中。

### 何时使用订阅

在大多数情况下，间歇性轮询或手动重新获取实际上是让客户端保持最新状态的最佳方法。那么什么时候订阅是最好的选择呢？在以下情况下，订阅特别有用：

1. 初始状态很大，但是增量变化集很小。可以通过查询获取初始状态，然后通过订阅进行更新。
2. 在你关心的是低延迟更新等特定事件的情况下，例如在聊天应用中，用户希望在几秒钟之内收到新消息。

未来版本的 Apollo 或 GraphQL 可能会包含对实时查询的支持，这将是一种代替轮询的低延迟方式。但当前除了在一些相对实验性的设置之外，尚无法实现 GraphQL 中的常规实时查询。

## 客户端设置

在本文中，我们将说明如何在客户端上设置订阅，但你还需要服务端的实现。你可以[了解如何在 JavaScript 服务端使用订阅](https://www.apollographql.com/docs/graphql-subscriptions/setup)，或是使用 [Graphcool](https://www.graph.cool/docs/tutorials/worldchat-subscriptions-example-ui0eizishe/) 之类的 GraphQL BAAS 来享受开箱即用的订阅设置。

让我们看一下如何为 Apollo Client 的传输添加支持。

首先，初始化 GraphQL websocket 连接：

```js
import { WebSocketLink } from "@apollo/client/link/ws";

const wsLink = new WebSocketLink({
  uri: `ws://localhost:5000/`,
  options: {
    reconnect: true
  }
});
```

We need to either use the `WebSocketLink` or the `HttpLink` depending on the operation type:

```js
import { HttpLink, split } from "@apollo/client/core";
import { WebSocketLink } from "@apollo/client/link/ws";
import { getMainDefinition } from "@apollo/client/utilities";

// 创建一个 http 连接：
const httpLink = new HttpLink({
  uri: "http://localhost:3000/graphql"
});

// 创建一个 WebSocket 连接：
const wsLink = new WebSocketLink({
  uri: `ws://localhost:5000/`,
  options: {
    reconnect: true
  }
});

// 使用拆分连接的功能，你可以根据要发送的操作类型将数据发送到每个连接
const link = split(
  // 根据操作类型拆分
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  httpLink
);
```

现在查询和变更将照常通过 HTTP 进行，但是订阅将通过 websocket 传输进行。

## useSubscription

向 UI 添加实时数据的最简单方法是使用 `useSubscription` 组合函数。这样你就可以不断地从服务器接收更新，以更新 `Ref` 或响应式对象，从而重新渲染组件。需要注意的一件事是，订阅只是侦听器，首次连接时它们不请求任何数据：它们仅打开连接以获取新数据。

首先在组件中导入 `useSubscription`：

```vue{2}
<script>
import { useSubscription } from "@vue/apollo-composable";

export default {
  setup() {
    // 数据和逻辑在这里……
  }
};
</script>
```

然后我们可以传递 GraphQL 文档作为第一个参数，并获取 `result` ref：

```vue{6-13}
<script>
import { useSubscription } from "@vue/apollo-composable";

export default {
  setup() {
    const { result } = useSubscription(gql`
      subscription onMessageAdded {
        messageAdded {
          id
          text
        }
      }
    `);
  }
};
</script>
```

然后我们可以在接收到新数据时 `watch` 结果：

```vue{2,16-20}
<script>
import { watch } from "vue";
import { useSubscription } from "@vue/apollo-composable";

export default {
  setup() {
    const { result } = useSubscription(gql`
      subscription onMessageAdded {
        messageAdded {
          id
          text
        }
      }
    `);

    watch(
      result,
      data => {
        console.log("New message received:", data.messageAdded);
      },
      {
        lazy: true // 不要立即执行处理程序
      }
    );
  }
};
</script>
```

例如，我们可以在收到消息时显示消息列表：

```vue{2,7,19,24-26,31-39}
<script>
import { watch, ref } from "vue";
import { useSubscription } from "@vue/apollo-composable";

export default {
  setup() {
    const messages = ref([]);

    const { result } = useSubscription(gql`
      subscription onMessageAdded {
        messageAdded {
          id
          text
        }
      }
    `);

    watch(
      result,
      data => {
        messages.value.push(data.messageAdded);
      },
      {
        lazy: true // 不要立即执行处理程序
      }
    );

    return {
      messages
    };
  }
};
</script>

<template>
  <div>
    <ul>
      <li v-for="message of messages" :key="message.id">
        {{ message.text }}
      </li>
    </ul>
  </div>
</template>
```

### 变量

我们可以在第二个参数中传递变量。就像 `useQuery`一样，它可以是对象，`Ref`，响应式对象或将成为响应式的函数。

使用 Ref：

```js
const variables = ref({
  channelId: "abc"
});

const { result } = useSubscription(
  gql`
    subscription onMessageAdded($channelId: ID!) {
      messageAdded(channelId: $channelId) {
        id
        text
      }
    }
  `,
  variables
);
```

使用响应式对象：

```js
const variables = reactive({
  channelId: "abc"
});

const { result } = useSubscription(
  gql`
    subscription onMessageAdded($channelId: ID!) {
      messageAdded(channelId: $channelId) {
        id
        text
      }
    }
  `,
  variables
);
```

使用函数（将会是响应式的）：

```js
const channelId = ref("abc");

const { result } = useSubscription(
  gql`
    subscription onMessageAdded($channelId: ID!) {
      messageAdded(channelId: $channelId) {
        id
        text
      }
    }
  `,
  () => ({
    channelId: channelId.value
  })
);
```

### 选项

与变量类似，你可以将选项传递给 `useSubscription` 的第三个参数：

```js
const { result } = useSubscription(
  gql`
    subscription onMessageAdded($channelId: ID!) {
      messageAdded(channelId: $channelId) {
        id
        text
      }
    }
  `,
  null,
  {
    fetchPolicy: "no-cache"
  }
);
```

它也可以是响应式对象，也可以是将自动变为响应式的函数：

```js
const { result } = useSubscription(
  gql`
    subscription onMessageAdded($channelId: ID!) {
      messageAdded(channelId: $channelId) {
        id
        text
      }
    }
  `,
  null,
  () => ({
    fetchPolicy: "no-cache"
  })
);
```

在 [API 参考](../api/use-subscription) 查看所有可用的选项。

### 禁用订阅

你可以使用 `enabled` 选项来禁用和重新启用订阅：

```js
const enabled = ref(false);

const { result } = useSubscription(
  gql`
  ...
`,
  null,
  () => ({
    enabled: enabled.value
  })
);

function enableSub() {
  enabled.value = true;
}
```

### 订阅状态

你可以从 `useSubscription` 中检索加载和错误状态：

```js
const { loading, error } = useSubscription(...)
```

### 事件钩子

#### onResult

从服务端收到新结果时调用。

```js
const { onResult } = useSubscription(...)

onResult(result => {
  console.log(result.data)
})
```

#### onError

发生错误时触发：

```js
import { logErrorMessages } from '@vue/apollo-util'

const { onError } = useSubscription(...)

onError(error => {
  logErrorMessages(error)
})
```

## subscribeToMore

使用 GraphQL 订阅，你的客户端将在服务器推送时收到警报，并且你应该选择最适合你应用的模式：

- 将它用作通知，并在触发时运行任何你想要的逻辑，例如提醒用户或重新获取数据
- 使用与通知一起发送的数据，并将其直接合并到存储中（现有查询将自动得到通知）

使用 `subscribeToMore`，你可以很轻松地做到后者。

`subscribeToMore` 是在每个使用 `useQuery` 创建的查询上都可用的函数。它的工作原理和 [`fetchMore`](./cache-interaction/#incremental-loading-fetchmore) 一样，除了每次订阅返回时都会调用 update 函数，而不是仅调用一次。

让我们从[变更](./mutation)一节中的示例组件中进行查询（稍作修改以使用一个变量）：

```vue
<script>
const MESSAGES = gql`
  query getMessages($channelId: ID!) {
    messages(channelId: $channelId) {
      id
      text
    }
  }
`;

export default {
  props: ["channelId"],

  setup(props) {
    // 消息列表
    const { result } = useQuery(MESSAGES, () => ({
      channelId: props.channelId
    }));
    const messages = useResult(result, []);

    return {
      messages
    };
  }
};
</script>
```

现在将订阅添加到该查询中。

从 `useQuery` 中取出 `subscribeToMore` 函数：

```vue{16,21}
<script>
const MESSAGES = gql`
  query getMessages($channelId: ID!) {
    messages(channelId: $channelId) {
      id
      text
    }
  }
`;

export default {
  props: ["channelId"],

  setup(props) {
    // 消息列表
    const { result, subscribeToMore } = useQuery(MESSAGES, () => ({
      channelId: props.channelId
    }));
    const messages = useResult(result, []);

    subscribeToMore();

    return {
      messages
    };
  }
};
</script>
```

它需要一个对象或一个会自动变为响应式的函数：

```js
subscribeToMore({
  // 选项……
});
```

```js
subscribeToMore(() => ({
  // 选项……
}));
```

在后一种情况下，订阅将随着选项的更改自动重新启动。

现在你可以为 GraphQL 文档放置​​相关的订阅，并在必要时添加变量：

```vue{21-33}
<script>
const MESSAGES = gql`
  query getMessages($channelId: ID!) {
    messages(channelId: $channelId) {
      id
      text
    }
  }
`;

export default {
  props: ["channelId"],

  setup(props) {
    // 消息列表
    const { result, subscribeToMore } = useQuery(MESSAGES, () => ({
      channelId: props.channelId
    }));
    const messages = useResult(result, []);

    subscribeToMore(() => ({
      document: gql`
        subscription onMessageAdded($channelId: ID!) {
          messageAdded(channelId: $channelId) {
            id
            text
          }
        }
      `,
      variables: {
        channelId: props.channelId
      }
    }));

    return {
      messages
    };
  }
};
</script>
```

现在订阅已被添加到查询中，我们需要告诉 Apollo Client 如何使用 `updateQuery` 选项来更新查询结果：

```js{13-16}
subscribeToMore(() => ({
  document: gql`
    subscription onMessageAdded($channelId: ID!) {
      messageAdded(channelId: $channelId) {
        id
        text
      }
    }
  `,
  variables: {
    channelId: props.channelId
  },
  updateQuery: (previousResult, { subscriptionData }) => {
    previousResult.messages.push(subscriptionData.data.messageAdded);
    return previousResult;
  }
}));
```

## 通过 WebSocket 进行身份验证

在很多情况下，在允许客户端接收订阅结果之前，有必要对客户端进行身份验证。为此 `SubscriptionClient` 构造函数接受一个 `connectionParams` 字段，该字段传递一个自定义对象，服务端可以在设置任何订阅之前使用该对象来验证连接。

```js
import { WebSocketLink } from "@apollo/client/link/ws";

const wsLink = new WebSocketLink({
  uri: `ws://localhost:5000/`,
  options: {
    reconnect: true,
    connectionParams: {
        authToken: user.authToken,
    },
});
```

::: tip
`connectionParams` 可以用于可能需要的任何其他用途，不仅可以进行身份​​验证，还可以使用 [SubscriptionsServer](https://www.apollographql.com/docs/graphql-subscriptions/authentication) 在服务端检查负载。
:::
