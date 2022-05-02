# 变更

现在我们已经学习了[如何获取数据](./query)，下一步是学习如何使用**变更**来更新数据。如果你需要复习变更或 GraphQL 文档，请阅读[本指南](https://graphql.org/learn/queries/#mutations)。

## 执行一个变更

`useMutation` 组合函数是在 Vue 组件中设置变更的主要方式。

首先在组件中导入它：

```vue
<script>
import { useMutation } from '@vue/apollo-composable'

export default {
  setup () {
    // 你的数据和逻辑在这里……
  },
}
</script>
```

你可以在 `setup` 选项中使用 `useMutation`，并将 GraphQL 文档作为第一个参数传递给它，然后取回 `mutate` 函数：

```vue{3,7-13}
<script>
import { useMutation } from '@vue/apollo-composable'
import gql from 'graphql-tag'

export default {
  setup () {
    const { mutate } = useMutation(gql`
      mutation sendMessage ($input: SendMessageInput!) {
        sendMessage (input: $input) {
          id
        }
      }
    `)
  },
}
</script>
```

通常来说将 `mutate` 函数重命名为更明确的名称是一个好主意：

```vue{7}
<script>
import { useMutation } from '@vue/apollo-composable'
import gql from 'graphql-tag'

export default {
  setup () {
    const { mutate: sendMessage } = useMutation(gql`
      mutation sendMessage ($input: SendMessageInput!) {
        sendMessage (input: $input) {
          id
        }
      }
    `)
  },
}
</script>
```

现在，我们可以传递变量给 `mutate`（现在称为 `sendMessage`）来在模板中使用它：

```vue{15-17,22-28}
<script>
import { useMutation } from '@vue/apollo-composable'
import gql from 'graphql-tag'

export default {
  setup () {
    const { mutate: sendMessage } = useMutation(gql`
      mutation sendMessage ($text: String!) {
        sendMessage (text: $text) {
          id
        }
      }
    `)

    return {
      sendMessage,
    }
  },
}
</script>

<template>
  <div>
    <button @click="sendMessage({ text: 'Hello' })">
      Send message
    </button>
  </div>
</template>
```

我们也可以在 Javascript 代码中调用 `sendMessage`。

### 选项

我们可以传递选项作为 `useMutation` 的第二个参数：

```js
const { mutate: sendMessage } = useMutation(gql`
  mutation sendMessage ($text: String!) {
    sendMessage (text: $text) {
      id
    }
  }
`, {
  fetchPolicy: 'no-cache',
})
```

它也可以是一个返回选项对象的函数。在 Apollo Client 上执行变更之前，它将在调用 `mutate`（此处为 `sendMessage`）时自动调用：

```js{7-9}
const { mutate: sendMessage } = useMutation(gql`
  mutation sendMessage ($text: String!) {
    sendMessage (text: $text) {
      id
    }
  }
`, () => ({
  fetchPolicy: 'no-cache',
}))
```

在 [API 参考](../api/use-mutation) 查看所有可用的选项.

### 变量

有两种方法将变量对象传递给变更。

我们已经看到了第一个：我们可以在调用 `mutate` 函数时传递变量：

```js
const { mutate: sendMessage } = useMutation(gql`
  mutation sendMessage ($text: String!) {
    sendMessage (text: $text) {
      id
    }
  }
`)

sendMessage({
  text: 'Hello',
})
```

另一种方法是将它们放在 `options` 中：

```js{7-11,13}
const { mutate: sendMessage } = useMutation(gql`
  mutation sendMessage ($text: String!) {
    sendMessage (text: $text) {
      id
    }
  }
`, {
  variables: {
    text: 'Hello',
  },
})

sendMessage()
```

大多数时候，我们的变量都是动态的。假设我们有一个由用户更新的 `text` ref：

```js{1,11}
const text = ref('')

const { mutate: sendMessage } = useMutation(gql`
  mutation sendMessage ($text: String!) {
    sendMessage (text: $text) {
      id
    }
  }
`, {
  variables: {
    text: text.value,
  },
})

sendMessage()
```

这样是行不通的！事实上我们只设置了一次变量，所以即使在之后更改 `text` ref，`variables.text` 也将永远是一个空字符串。

解决方案是使用选项函数语法，这样在每次执行变更时都会调用它：

```js{9,13}
const text = ref('')

const { mutate: sendMessage } = useMutation(gql`
  mutation sendMessage ($text: String!) {
    sendMessage (text: $text) {
      id
    }
  }
`, () => ({
  variables: {
    text: text.value,
  },
}))

sendMessage()
```

现在，我们的组件看起来像这样：

```vue{2,8,16-20,23,32,34}
<script>
import { ref } from 'vue'
import { useMutation } from '@vue/apollo-composable'
import gql from 'graphql-tag'

export default {
  setup () {
    const text = ref('')

    const { mutate: sendMessage } = useMutation(gql`
      mutation sendMessage ($text: String!) {
        sendMessage (text: $text) {
          id
        }
      }
    `, () => ({
      variables: {
        text: text.value,
      },
    }))

    return {
      text,
      sendMessage,
    }
  },
}
</script>

<template>
  <div>
    <input v-model="text" placeholder="Enter a message">

    <button @click="sendMessage()">
      Send message
    </button>
  </div>
</template>
```

如果你在选项中指定了一个变量对象，并且在调用 `mutate` 时又指定了一个变量对象，那么两个对象将被合并。

```js
const text = ref('')

const { mutate: sendMessage } = useMutation(gql`
  mutation sendMessage ($text: String!, $subject: String!) {
    sendMessage (text: $text, subject: $subject) {
      id
    }
  }
`, () => ({
  variables: {
    subject: 'Message sent from my app',
  },
}))

sendMessage({
  text: text.value,
})
```

## 变更后更新缓存

执行变更时将修改服务器上的数据。在大多数情况下，该数据也位于客户端缓存中，因此你可能需要更新它来反映该变更所做的更改。这取决于变更是否只更新单个现有实体。

### 更新单个现有实体

在这种情况下，Apollo Client 将会自动使用变更执行返回的数据来更新缓存中的实体。它将使用修改后的实体的 `id` 和 `__typename` 在缓存中查找并更新修改后的字段。

```js
const { mutate: editMessage } = useMutation(gql`
  mutation editMessage ($id: ID!, $text: String!) {
    editMessage (id: $id, text: $text) {
      id
      text
    }
  }
`, () => ({
  variables: {
    id: 'abc',
    text: 'Hi! How is it going?',
  },
}))

editMessage()
```

在此示例中，如果我们已经加载的消息列表中包含 `id` 等于 `abc` 的消息，则该变更会在缓存中搜索它并自动更新它的 `text` 字段。

### 更新所有其他缓存

如果某个变更修改了多个实体，或者它创建或删除了一个或多个实体，Apollo Client 将**不会**自​​动更新缓存以反映该变更所做的更改。相反，你应该使用选项中的 `update` 函数来更新缓存。

这个 `update` 函数的目的是修改缓存的数据，以匹配服务端变更所做出的更改。

例如，我们的 `sendMessage` 变更应该将新消息添加到我们的缓存中：

```vue{33-37}
<script>
import { useQuery, useMutation } from '@vue/apollo-composable'
import gql from 'graphql-tag'

const MESSAGES = gql`
  query getMessages {
    messages {
      id
      text
    }
  }
`

export default {
  setup () {
    // Messages list
    const { result } = useQuery(MESSAGES)
    const messages = computed(() => result.value.messages ?? [])

    // Send a new message
    const newMessage = ref('')
    const { mutate: sendMessage } = useMutation(gql`
      mutation sendMessage ($text: String!) {
        sendMessage (text: $text) {
          id
          text
        }
      }
    `, () => ({
      variables: {
        text: newMessage.value,
      },
      update: (cache, { data: { sendMessage } }) => {
        const data = cache.readQuery({ query: MESSAGES })
        data.messages.push(sendMessage)
        cache.writeQuery({ query: MESSAGES, data })
      },
    }))

    return {
      messages,
      newMessage,
      sendMessage,
    }
  },
}
</script>

<template>
  <div>
    <input v-model="newMessage" @keyup.enter="
      sendMessage()
      newMessage = ''
    ">

    <ul v-if="messages">
      <li v-for="message of messages" :key="message.id">
        {{ message.text }}
      </li>
    </ul>
  </div>
</template>
```

让我们只关注变更：

```js{12-16}
const { mutate: sendMessage } = useMutation(gql`
  mutation sendMessage ($text: String!) {
    sendMessage (text: $text) {
      id
      text
    }
  }
`, () => ({
  variables: {
    text: newMessage.value,
  },
  update: (cache, { data: { sendMessage } }) => {
    const data = cache.readQuery({ query: MESSAGES })
    data.messages.push(sendMessage)
    cache.writeQuery({ query: MESSAGES, data })
  },
}))
```

`update` 函数获取一个代表 Apollo Client 缓存的 `cache` 对象。它提供了 `readQuery` 和 `writeQuery` 函数，使你能够在缓存上执行 GraphQL 操作并修改预期的结果。

第二个参数是一个包含变更结果数据的对象。它应当被用于修改缓存的数据，并通过 `cache.writeQuery` 将其写回。

调用 `update` 函数后，缓存中数据被修改的组件将自动重新渲染。在我们的示例中，消息列表将自动更新从变更结果中收到的新消息。

另外，我们可以在调用 `mutate` 函数时在第二个参数传递一个 `update` 函数：

```js{14-20}
const { mutate: sendMessage } = useMutation(gql`
  mutation sendMessage ($text: String!) {
    sendMessage (text: $text) {
      id
      text
    }
  }
`)

sendMessage(
  {
    text: text.value
  },
  {
    update: (cache, { data: { sendMessage } }) => {
      const data = cache.readQuery({ query: MESSAGES });
      data.messages.push(sendMessage);
      cache.writeQuery({ query: MESSAGES, data });
    }
  }
);
```

## 变更状态

### 加载

使用从 `useMutation` 返回的 `loading` ref 来跟踪变更是否正在进行中：

```js
const { mutate: sendMessage, loading: sendMessageLoading } = useMutation(gql`
  mutation sendMessage ($text: String!) {
    sendMessage (text: $text) {
      id
      text
    }
  }
`)
```

重命名通常是一个好主意（这里是 `sendMessageLoading`）。

### 错误

使用 `error` ref 来跟踪在变更中是否发生任何错误：

```js
const { mutate: sendMessage, error: sendMessageError } = useMutation(gql`
  mutation sendMessage ($text: String!) {
    sendMessage (text: $text) {
      id
      text
    }
  }
`)
```

## 事件钩子

### onDone

在变更成功完成时调用。

```js
const { onDone } = useMutation(...)

onDone(result => {
  console.log(result.data)
})
```

在我们的示例中，这对于重置消息输入非常有用：

```vue{22,40-42,55}
<script>
import { useQuery, useMutation } from '@vue/apollo-composable'
import gql from 'graphql-tag'

const MESSAGES = gql`
  query getMessages {
    messages {
      id
      text
    }
  }
`

export default {
  setup () {
    // Messages list
    const { result } = useQuery(MESSAGES)
    const messages = computed(() => result.value?.messages ?? [])

    // Send a new message
    const newMessage = ref('')
    const { mutate: sendMessage, onDone } = useMutation(gql`
      mutation sendMessage ($text: String!) {
        sendMessage (text: $text) {
          id
          text
        }
      }
    `, () => ({
      variables: {
        text: newMessage.value,
      },
      update: (cache, { data: { sendMessage } }) => {
        const data = cache.readQuery({ query: MESSAGES })
        data.messages.push(sendMessage)
        cache.writeQuery({ query: MESSAGES, data })
      },
    }))

    onDone(() => {
      newMessage.value = ''
    })

    return {
      messages,
      newMessage,
      sendMessage,
    }
  },
}
</script>

<template>
  <div>
    <input v-model="newMessage" @keyup.enter="sendMessage()">

    <ul v-if="messages">
      <li v-for="message of messages" :key="message.id">
        {{ message.text }}
      </li>
    </ul>
  </div>
</template>
```

### onError

在变更期间发生错误时触发。

```js
import { logErrorMessages } from '@vue/apollo-util'

const { onError } = useMutation(...)

onError(error => {
  logErrorMessages(error)
})
```
