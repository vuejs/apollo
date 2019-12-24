# Mutations

Now that's we've learned [how to fetch data](./query), the next logical step is to study how to update data using **mutations**. If you need a refresher on mutations or GraphQL documents, read [this guide](https://graphql.org/learn/queries/#mutations).

## Executing a mutation

The `useMutation` composition function is the main way of setting up mutations in Vue components.

Start by importing it in your component:

```vue
<script>
import { useMutation } from '@vue/apollo-composable'

export default {
  setup () {
    // Your data & logic here...
  },
}
</script>
```

You can use `useMutation` in your `setup` option by passing it a GraphQL document as the first parameter and retrieve the `mutate` function:

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

It's generally a good idea to rename the `mutate` function into something more explicit:

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

We can now use it in our template by passing variables to `mutate` (now called `sendMessage`):

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

We can call `sendMessage` in our JavaScript code too.

### Options

We can pass options to `useMutation` as the 2nd parameter:

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

It can also be a function that returns the options object. It will be automatically called when `mutate` (here `sendMessage`) is called, before executing the mutation on Apollo Client:

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

See the [API Reference](../api/use-mutation) for all the possible options.

### Variables

There are two ways of passing a variables object to the mutation.

We already saw the first one: we can pass the variables when calling the `mutate` function:

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

The other way is to put them in the `options`:

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

Most of the time, our variables will be dynamic though. Let's say we have a `text` ref that will be updated by the user:

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

This will not work! Indeed, we set up the variables only once, so `variables.text` will forever be an empty string even if the `text` ref is changed later.

The solution is to use the options function syntax, so it is called each time the mutation is executed:

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

Our component now looks like:

```vue{2,8,16-20,23,32,34}
<script>
import { ref } from '@vue/composition-api'
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

The variables objects will be merged if you specify one in the options and one when calling `mutate`:

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

## Updating the cache after a mutation

When you execute a mutation, you modify data on your server. In most case, this data was also in your client cache, so you might need to update it to reflect the changes made by the mutation. This depends on whether the mutation updates a single existing entity.

### Updating a single existing entity

In this case, Apollo Client will automatically update the entity in the cache, using the data returned by the mutation execution. It will use the `id` of the modified entity alongside its `__typename` to find it in the cache and update the modified fields.

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

In this example, if we already loaded the list of messages containing the one with `id` equals to `abc`, the mutation will search the cache for it and update its `text` field automatically.

### Making all other cache updates

If a mutation modifies multiple entities, or if it creates or deletes one or many entities, the Apollo Client will *not* automatically update the cache to reflect the changes made by the mutation. Instead, you should update the cache using an `update` function in the options.

The purpose of this `update` function is to modify your cached data to match the changes made by the mutation on the server.

For example, our `sendMessage` mutation should add the new message to our cache:

```vue{33-37}
<script>
import { useQuery, useResult, useMutation } from '@vue/apollo-composable'
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
    const messages = useResult(result, [])

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

Let's focus on the mutation:

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

The `update` function gets a `cache` object representing the Apollo Client cache. It provides the `readQuery` and `writeQuery` function that enable you to execute GraphQL operations on the cache and modify the expected result.

The 2nd argument is an object containing the data from the mutation result. This should be used to modify the cached data and write it back with `cache.writeQuery`.

After the `update` function is called, the components whose data has been changed in the cache will automatically re-render. In our example, the list of messages will automatically update with the new message received from the mutation result.

Alternatively, we can pass an `update` function within the second parameter when calling the `mutate`  function:

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

## Mutation state

### Loading

Use the `loading` ref returned from `useMutation` to track if the mutation is in progress:

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

It's generally a good idea to rename it (here to `sendMessageLoading`).

### Error

Track if any error occured during the mutation with the `error` ref:

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

## Event hooks

### onDone

This is called when the mutation successfully completes.

```js
const { onDone } = useMutation(...)

onDone(result => {
  console.log(result.data)
})
```

In our example, this is very useful for resetting the message input:

```vue{22,40-42,55}
<script>
import { useQuery, useResult, useMutation } from '@vue/apollo-composable'
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
    const messages = useResult(result, [])

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

This is triggered when an error occurs during the mutation.

```js
import { logErrorMessages } from '@vue/apollo-util'

const { onError } = useMutation(...)

onError(error => {
  logErrorMessages(error)
})
```
