# 查询

获取数据涉及使用标准 GraphQL 文档执行 **query** 操作。你可以在[这里](https://graphql.org/learn/queries/)和[在 playground 上实践查询的运行](https://www.apollographql.com/docs/react/development-testing/developer-tooling/#features)上了解有关查询和 GraphQL 文档的更多信息。

## 执行一个查询

### GraphQL 文档

在本节中，我们以这个 GraphQL 文档为例：

```graphql
query getUsers {
  users {
    id
    firstname
    lastname
    email
  }
}
```

::: tip
建议为 GraphQL 操作命名（此处为 `getUsers`），这样在 Apollo Client 开发工具中能更容易找到它们。
:::

该查询将返回包含一个 `users` 数组的一个 `data` 对象，数组中包括 `id`、`firstname`、`lastname` 和`email`。它可能看起来像这样：

```json
{
  "data": {
    "users": [
      {
        "id": "abc",
        "firstname": "James",
        "lastname": "Holden",
        "email": "james.holden@roci.com"
      },
      {
        "id": "def",
        "firstname": "Naomi",
        "lastname": "Nagata",
        "email": "naomi.nagata@roci.com"
      }
    ]
  }
}
```

你可能会问：为什么在 `data` 上有一个嵌套的 `users` 属性？为什么数组不直接放在 `data` 上？

这是因为你可以在 GraphQL 操作中选择多个根字段：

```graphql
query getCatsAndDogs {
  cats {
    id
  }

  dogs {
    id
  }
}
```

在这种情况下，结果可能如下所示：

```json
{
  "data": {
    "cats": [
      { "id": "abc" },
      { "id": "def" }
    ],
    "dogs": [
      { "id": "ghi" },
      { "id": "jkl" }
    ]
  }
}
```

结果中除了 `data` 以外，还会存在以下可选属性：
- `errors`：服务器返回的一系列错误
- `extensions`：附加信息，例如执行时间

### useQuery

用于执行查询的主要组合函数是 `useQuery`。首先在组件中导入它：

```vue
<script>
import { useQuery } from '@vue/apollo-composable'

export default {
  setup () {
    // 你的数据和逻辑在这里……
  },
}
</script>
```

你可以在 `setup` 选项中使用 `useQuery`，并将 GraphQL 文档作为第一个参数传递给它。然后取回查询 `result`：

```vue{3,7-16}
<script>
import { useQuery } from '@vue/apollo-composable'
import gql from 'graphql-tag'

export default {
  setup () {
    const { result } = useQuery(gql`
      query getUsers {
        users {
          id
          firstname
          lastname
          email
        }
      }
    `)
  },
}
</script>
```

注意这里的 `result` 是一个 `Ref`，用于保存 Apollo 返回结果中的数据。

如果要直接访问数据对象，请使用 `result.value`：

```vue{2,19-21}
<script>
import { watch } from 'vue'
import { useQuery } from '@vue/apollo-composable'
import gql from 'graphql-tag'

export default {
  setup () {
    const { result } = useQuery(gql`
      query getUsers {
        users {
          id
          firstname
          lastname
          email
        }
      }
    `)

    watch(() => {
      console.log(result.value)
    })
  },
}
</script>
```

在当前示例中，你还可以直接侦听 `Ref`：

```vue{19-20}
<script>
import { watch } from 'vue'
import { useQuery } from '@vue/apollo-composable'
import gql from 'graphql-tag'

export default {
  setup () {
    const { result } = useQuery(gql`
      query getUsers {
        users {
          id
          firstname
          lastname
          email
        }
      }
    `)

    watch(result, value => {
      console.log(value)
    })
  },
}
</script>
```

让我们将结果暴露给模板：

```vue{18-20,25-31}
<script>
import { useQuery } from '@vue/apollo-composable'
import gql from 'graphql-tag'

export default {
  setup () {
    const { result } = useQuery(gql`
      query getUsers {
        users {
          id
          firstname
          lastname
          email
        }
      }
    `)

    return {
      result,
    }
  },
}
</script>

<template>
  <ul>
    <li v-for="user of result.users" :key="user.id">
      {{ user.firstname }} {{ user.lastname }}
    </li>
  </ul>
</template>
```

注意 `result` 可能不会一直包含你的数据！初始值将是 `undefined`，直到查询成功完成。因此最好在渲染数据之前添加条件代码：

```vue{2}
<template>
  <ul v-if="result && result.users">
    <li v-for="user of result.users" :key="user.id">
      {{ user.firstname }} {{ user.lastname }}
    </li>
  </ul>
</template>
```

## 查询状态

### 加载状态

`useQuery` 在 `result` 旁边还会返回 `loading`，一个布尔值 `Ref` 来跟踪查询的加载状态：

```vue{7,20,27,29}
<script>
import { useQuery } from '@vue/apollo-composable'
import gql from 'graphql-tag'

export default {
  setup () {
    const { result, loading } = useQuery(gql`
      query getUsers {
        users {
          id
          firstname
          lastname
          email
        }
      }
    `)

    return {
      result,
      loading,
    }
  },
}
</script>

<template>
  <div v-if="loading">Loading...</div>

  <ul v-else-if="result && result.users">
    <li v-for="user of result.users" :key="user.id">
      {{ user.firstname }} {{ user.lastname }}
    </li>
  </ul>
</template>
```

### 错误

还有一个 `error` `Ref` 包含在请求期间可能发生的任何错误：

```vue{7,21,30}
<script>
import { useQuery } from '@vue/apollo-composable'
import gql from 'graphql-tag'

export default {
  setup () {
    const { result, loading, error } = useQuery(gql`
      query getUsers {
        users {
          id
          firstname
          lastname
          email
        }
      }
    `)

    return {
      result,
      loading,
      error,
    }
  },
}
</script>

<template>
  <div v-if="loading">Loading...</div>

  <div v-else-if="error">Error: {{ error.message }}</div>

  <ul v-else-if="result && result.users">
    <li v-for="user of result.users" :key="user.id">
      {{ user.firstname }} {{ user.lastname }}
    </li>
  </ul>
</template>
```

## useResult

除了 `useQuery` 之外，还有姐妹组合函数 `useResult`，以方便对查询 `result` 的使用。

### 结果挑选

`useResult` 的第一个有用功能是从结果数据中挑选出一个对象。为此，将 `result` 数据作为第一个参数，并将挑选函数作为第三个参数：

```vue{2,18,21,34,35}
<script>
import { useQuery, useResult } from '@vue/apollo-composable'
import gql from 'graphql-tag'

export default {
  setup () {
    const { result, loading, error } = useQuery(gql`
      query getUsers {
        users {
          id
          firstname
          lastname
          email
        }
      }
    `)

    const users = useResult(result, null, data => data.users)

    return {
      users,
      loading,
      error,
    }
  },
}
</script>

<template>
  <div v-if="loading">Loading...</div>

  <div v-else-if="error">Error: {{ error.message }}</div>

  <ul v-else-if="users">
    <li v-for="user of users" :key="user.id">
      {{ user.firstname }} {{ user.lastname }}
    </li>
  </ul>
</template>
```

如果与组件相关的数据嵌套在查询中，这将非常有用：

```js
const { result } = useQuery(gql`
  query getMessages {
    currentUser {
      messages {
        id
        text
      }
    }
  }
`)

const messages = useResult(result, null, data => data.currentUser.messages)
```

`useResult` 的另一个好处是，挑选函数会让其内部的错误静音。例如，如果 `result.value` 是 `undefined`，你不必添加额外的检查：

```js
// 你不需要这样做！
const messages = useResult(result, null, data => data && data.currentUser && data.currentUser.messages)

// 而是这样做：
const messages = useResult(result, null, data => data.currentUser.messages)
```

::: tip
不要忘记，在查询成功完成之前，`messages.value` 仍然可以是 `null`！
:::

证明 `useResult` 非常有用的另外一个用例是当结果数据上有多个对象时：

```js
const { result } = useQuery(gql`
  query getUsersAndPosts {
    users {
      id
      email
    }

    posts {
      id
      title
    }
  }
`)

const users = useResult(result, null, data => data.users)

const posts = useResult(result, null, data => data.posts)
```

看看我们是怎样将结果数据干净地分成两个不同的 `Ref`！

### 自动挑选

如果在数据中只有一个对象，`useResult` 将尝试自动挑选该对象：

```js{12}
const { result, loading } = useQuery(gql`
  query getUsers {
    users {
      id
      firstname
      lastname
      email
    }
  }
`)

const users = useResult(result)
```

这里的 `users.value` 将是从服务器中检索到的 `users` 数组。

### 默认值

假设我们想根据用户的姓氏进行排序：

```vue{2,19-21,24,34,35}
<script>
import { computed } from 'vue'
import { useQuery } from '@vue/apollo-composable'
import gql from 'graphql-tag'

export default {
  setup () {
    const { result, loading } = useQuery(gql`
      query users {
        users {
          id
          firstname
          lastname
          email
        }
      }
    `)

    const sortedUsers = computed(() => result.value.users.sort(
      (a, b) => a.lastname.localeCompare(b.lastname)
    ))

    return {
      sortedUsers,
      loading,
    }
  },
}
</script>

<template>
  <div v-if="loading">Loading...</div>

  <ul v-else-if="sortedUsers">
    <li v-for="user of sortedUsers" :key="user.id">
      {{ user.firstname }} {{ user.lastname }}
    </li>
  </ul>
</template>
```

在这里我们会遇到一个错误，因为 `result.value` 可能是 `undefined`（并且 `result.value.users` 也可能是 `undefined`）。因此当我们在 `computed` 属性中调用 `sort` 方法时将引发错误。

我们可以添加检查，但这很快就会变得乏味：

```js
const sortedUsers = computed(() => result.value && result.value.users ? result.value.users.sort(
  (a, b) => a.lastname.localeCompare(b.lastname)
) : [])
```

我们可以通过 `useResult` 进一步简化它：

```js{1,3,5}
const users = useResult(result) // 自动挑选

const sortedUsers = computed(() => users.value ? users.value.sort(
  (a, b) => a.lastname.localeCompare(b.lastname)
) : [])
```

但如果我们传递一个默认值作为 `useResult` 的第二个参数，则可以完全取消条件代码：

```js{1,3,5}
const users = useResult(result, []) // 默认为空数组

const sortedUsers = computed(() => users.value.sort(
  (a, b) => a.lastname.localeCompare(b.lastname)
))
```

如果我们想在 `setup` 函数中的多个地方使用 `users` 数组 `Ref` 时，这将更加有用！

## 变量

你可以把一个变量对象作为第二个参数传递给 `useQuery`：

```js
const { result } = useQuery(gql`
  query getUserById ($id: ID!) {
    user (id: $id) {
      id
      email
    }
  }
`, {
  id: 'abc-abc-abc',
})
```

### 变量 Ref

之后你可以通过检索它们的 `variables` `Ref` 来更改它们：

```js{1,12-16}
const { result, variables } = useQuery(gql`
  query getUserById ($id: ID!) {
    user (id: $id) {
      id
      email
    }
  }
`, {
  id: 'abc-abc-abc',
})

function selectUser (id) {
  variables.value = {
    id,
  }
}
```

::: tip
每次 `variables` 对象的属性更改时，都会重新获取查询。
:::

另外，你可以直接传递 `Ref`：

```js
import { ref } from 'vue'
```

```js{1-3,12}
const variables = ref({
  id: 'abc-abc-abc',
})

const { result } = useQuery(gql`
  query getUserById ($id: ID!) {
    user (id: $id) {
      id
      email
    }
  }
`, variables)

function selectUser (id) {
  variables.value = {
    id,
  }
}
```

### 响应式对象

你也可以传递一个响应式对象：

```js
import { reactive } from 'vue'
```

```js{1,15}
const variables = reactive({
  id: 'abc-abc-abc',
})

const { result } = useQuery(gql`
  query getUserById ($id: ID!) {
    user (id: $id) {
      id
      email
    }
  }
`, variables)

function selectUser (id) {
  variables.id = id
}
```

这也意味着你可以直接传递 `setup` 里的 `props`，因为 `props` 已经是一个响应式对象：

```js
export default {
  props: ['id'],

  setup (props) {
    const { result } = useQuery(gql`
      query getUserById ($id: ID!) {
        user (id: $id) {
          id
          email
        }
      }
    `, props)

    return {
      result,
    }
  },
}
```

但是请注意，如果你添加了 GraphQL 文档中未使用的新属性，就会遇到 GraphQL 验证错误！

### 变量函数

最后，你可以将传递一个返回对象的函数作为变量：

```js{12-14}
export default {
  props: ['id'],

  setup (props) {
    const { result } = useQuery(gql`
      query getUserById ($id: ID!) {
        user (id: $id) {
          id
          email
        }
      }
    `, () => ({
      id: props.id,
    }))

    return {
      result,
    }
  },
}
```

该变量函数将自动成为响应式的，因此每当 `props.id` 更改时，查询的 `variables` 对象也将被更新。

如果你想要在 `variables` 中使用一些 `Ref`，此语法也很有用：

```js
const id = ref('abc-abc-abc')

const { result } = useQuery(gql`
  query getUserById ($id: ID!) {
    user (id: $id) {
      id
      email
    }
  }
`, () => ({
  id: id.value
}))

function selectUser (id) {
  id.value = id
}
```

## 选项

`useQuery` 的第三个参数是一个选项对象，用于配置你的查询。

像 `variables` 一样，你可以传递一个 `Ref`，一个响应式对象或一个自动响应式的函数。

使用 `Ref`：

```js
const options = ref({
  fetchPolicy: 'cache-first',
})

const { result } = useQuery(gql`
  query getUsers {
    users {
      id
      email
    }
  }
`, null, options)
```

使用响应式对象：

```js
const options = reactive({
  fetchPolicy: 'cache-first',
})

const { result } = useQuery(gql`
  query getUsers {
    users {
      id
      email
    }
  }
`, null, options)
```

使用自动响应式的函数：

```js
const fetchPolicy = ref('cache-first')

const { result } = useQuery(gql`
  query getUsers {
    users {
      id
      email
    }
  }
`, null, () => ({
  fetchPolicy: fetchPolicy.value
}))
```

在 [API 参考](../api/use-query) 查看所有可用的选项。

### 禁用查询

你可以使用 `enabled` 选项来禁用和重新启用查询：

```js
const enabled = ref(false)

const { result } = useQuery(gql`
  ...
`, null, () => ({
  enabled: enabled.value,
}))

function enableQuery () {
  enabled.value = true
}
```

### 获取策略

`fetchPolicy` 选项可以让你自定义如何使用 Apollo Client 来缓存查询。

```js
const { result } = useQuery(gql`
  ...
`, null, {
  fetchPolicy: 'cache-and-network',
})
```

可用值为：

- `cache-first`（默认）：从缓存返回结果。仅当无法获得缓存结果时才从网络获取。
- `cache-and-network`：首先从缓存中返回结果（如果存在），然后在网络可用时返回网络结果。
- `cache-only`：从缓存返回结果（如果可用），否则失败。
- `network-only`：从网络返回结果并保存到缓存，如果网络调用未成功则失败。
- `no-cache`：从网络返回结果但不保存到缓存，如果网络调用未成功则失败。

## 更新缓存结果

查询完成后，它将使用结果数据来更新缓存（取决于[获取策略](#获取策略)）。这将提升下一次需要在应用中渲染数据时的性能，并确保所有依赖同一条数据的组件始终保持一致。

但是，有时你需要确保此数据与服务器相比是最新的。

### 轮询

轮询是指反复调用服务器以自动更新查询数据。

你可以使用 `pollInterval` 来启用轮询，它将是每次重复向服务器发出请求的间隔，以毫秒为单位。

在此示例中，我们将每秒轮询一次服务器：

```js
const { result } = useQuery(gql`
  ...
`, null, {
  pollInterval: 1000,
})
```

### 重新获取

另一种方法是响应事件来再次手动执行查询，而非使用固定的时间间隔。

这是通过 `refetch` 函数完成的：

```vue{7,24,40}
<script>
import { useQuery, useResult } from '@vue/apollo-composable'
import gql from 'graphql-tag'

export default {
  setup () {
    const { result, loading, error, refetch } = useQuery(gql`
      query getUsers {
        users {
          id
          firstname
          lastname
          email
        }
      }
    `)

    const users = useResult(result)

    return {
      users,
      loading,
      error,
      refetch,
    }
  },
}
</script>

<template>
  <div v-if="loading">Loading...</div>

  <div v-else-if="error">Error: {{ error.message }}</div>

  <ul v-else-if="users">
    <li v-for="user of users" :key="user.id">
      {{ user.firstname }} {{ user.lastname }}
    </li>

    <button @click="refetch()">Refresh</button>
  </ul>
</template>
```

## 事件钩子

`useQuery` 返回事件钩子，允许你在特定事件发生时执行代码。

### onResult

将在有新结果可用时调用。

```js
const { onResult } = useQuery(...)

onResult(queryResult => {
  console.log(queryResult.data)
  console.log(queryResult.loading)
  console.log(queryResult.networkStatus)
  console.log(queryResult.stale)
})
```

你可以传递 `notifyOnNetworkStatusChange` 选项，以强制查询在网络状态或错误更新时触发新结果：

```js
useQuery(gql`
  ...
`, null, {
  notifyOnNetworkStatusChange: true,
})
```

### onError

发生错误时触发：

```js
const { onError } = useQuery(...)

onError(error => {
  console.log(error.graphQLErrors)
  console.log(error.networkError)
})
```

你可以使用 `@vue/apollo-util` 包中的 `logErrorMessages` 函数在浏览器控制台中对错误进行格式化：

```js
import { logErrorMessages } from '@vue/apollo-util'

const { onError } = useQuery(...)

onError(error => {
  logErrorMessages(error)
})
```

错误示例：

![错误日志截图](/error-log.jpeg)

如果你使用的是 Webpack 或 Vue CLI，则最好仅在开发环境中使用它：

```js
import { logErrorMessages } from '@vue/apollo-util'

const { onError } = useQuery(...)

onError(error => {
  if (process.env.NODE_ENV !== 'production') {
    logErrorMessages(error)
  }
})
```

这样就会在编译项目到生产环境时将其删除。
