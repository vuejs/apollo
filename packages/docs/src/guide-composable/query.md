# Queries

Fetching data involves executing **query** operations using standard GraphQL documents. You can learn more about queries and GraphQL documents [here](https://graphql.org/learn/queries/) and [practice running queries in the playground](https://www.apollographql.com/docs/react/development-testing/developer-tooling/#features).

## Executing a query

### GraphQL document

Let's take this example GraphQL document throughout this section:

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
It is recommended to give a name to your GraphQL operations (here `getUsers`), so it is easier to find them in the Apollo Client devtools.
:::

This query would return a `data` object with an array of `users` with their `id`, `firstname`, `lastname` and `email`. It could look like this:

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

You may ask: why is there a nested `users` property on `data`? Why isn't the array directly on `data`?

This is because you can select multiple root fields in a GraphQL operation:

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

In this case, the result could look like this:

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

There can also be other optional properties on the result alongside `data`:
- `errors` : an array of errors returned by the server
- `extensions` : additional informations such as execution timings

### useQuery

The main composition function used to execute queries is `useQuery`. In your component, start by importing it:

```vue
<script>
import { useQuery } from '@vue/apollo-composable'

export default {
  setup () {
    // Your data & logic here...
  },
}
</script>
```

You can use `useQuery` in your `setup` option and pass it a GraphQL document as the first parameter. Then retrieve the query `result`:

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

Note that `result` here is a `Ref` holding the data from the result returned by Apollo.

If you want to directly access the data object, use `result.value`:

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

In this example, you could also watch the `Ref` directly:

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

Let's expose our result in the template:

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

Beware that `result` may not contain your data at all time! It will initially be `undefined` until the query successfully completes. So it's a good idea to add a conditional before rendering the data:

```vue{2}
<template>
  <ul v-if="result && result.users">
    <li v-for="user of result.users" :key="user.id">
      {{ user.firstname }} {{ user.lastname }}
    </li>
  </ul>
</template>
```

We can use a `computed` prop to simplify access to part of the result and to provide a default value:

```vue{2,19,22,30}
<script>
import { computed } from 'vue'
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

    const users = computed(() => result.value?.users ?? [])

    return {
      users,
    }
  },
}
</script>

<template>
  <ul>
    <li v-for="user of users" :key="user.id">
      {{ user.firstname }} {{ user.lastname }}
    </li>
  </ul>
</template>
```

## Query status

### Loading state

Alongside `result`, `useQuery` returns `loading`, a boolean `Ref` tracking the loading state of the query:

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

### Error

There is also an `error` `Ref` that holds any error that may occur during the request:

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

## Variables

You can pass a `variables` object to the 2nd parameter of `useQuery`:

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

### Variables Ref

You can change them later by retrieving their `variables` `Ref`:

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
This will re-fetch the query each time a property from the `variables` object changes.
:::

Alternatively, you can pass a `Ref` directly:

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

### Reactive object

You can also pass a reactive object:

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

This also means you can pass `props` from `setup` directly, since `props` is already a reactive object:

```js
export default {
  props: ['id'],

  setup(props) {
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

But beware if you add new props that aren't used in the GraphQL document, you will run into GraphQL validation errors!

### Variables function

Finally, you can pass variables as a function returning an object:

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

This variables function will be made reactive automatically, so whenever `props.id` changes, the `variables` object of the query will be updated.

This syntax is also useful if you want to use some `Ref`s in the `variables`:

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

function selectUser(id) {
  id.value = id
}
```

## Options

The third parameter of `useQuery` is an options object, used to configure your query.

Like `variables`, you can pass a `Ref`, a reactive object or a function that will automatically be reactive.

Using a `Ref`:

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

Using a reactive object:

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

Using a function that will automatically be reactive:

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

See the [API Reference](../api/use-query) for all the possible options.

### Disable a query

You can disable and re-enable a query with the `enabled` option:

```js
const enabled = ref(false)

const { result } = useQuery(gql`
  ...
`, null, () => ({
  enabled: enabled.value,
}))

function enableQuery() {
  enabled.value = true
}
```

### Fetch Policy

The `fetchPolicy` option allows you to customize how the query will use the Apollo Client cache.

```js
const { result } = useQuery(gql`
  ...
`, null, {
  fetchPolicy: 'cache-and-network',
})
```

Available values are:

- `cache-first` (default): return result from cache. Only fetch from network if cached result is not available.
- `cache-and-network`: return result from cache first (if it exists), then return network result once it's available.
- `cache-only`: return result from cache if available, fail otherwise.
- `network-only`: return result from network, fail if network call doesn't succeed, save to cache.
- `no-cache`: return result from network, fail if network call doesn't succeed, don't save to cache.

## Updating cached results

When a query is completed, it will update the cache with the result data (depending on the [fetch policy](#fetch-policy)). This improves performance the next time the data needs to be rendered in your application and ensures that all components relying on a piece of data is always consistent.

However, you sometimes want to make sure that this data is up-to-date compared to the server.

### Polling

Polling means repeatedly calling the server to automatically update the query data.

You can enable polling with the `pollInterval` which will be the interval in ms between each requests repeatedly made to the server.

In this example, we will poll the server every second:

```js
const { result } = useQuery(gql`
  ...
`, null, {
  pollInterval: 1000,
})
```

### Refetching

The other way is manually executing the query again in response to an event, as opposed to using a fixed interval.

This is done using the `refetch` function:

```vue{7,24,40}
<script>
import { useQuery } from '@vue/apollo-composable'
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

    const users = computed(() => result.value?.users)

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

### Providing new variables to `refetch`

You call `refetch` with a new set of variables like so:

```vue{41}
<script>
import { useQuery } from '@vue/apollo-composable'
import gql from 'graphql-tag'

export default {
  setup () {
    const { result, loading, error, refetch } = useQuery(gql`
      query getUsers($search: String) {
        users(search: $search) {
          id
          firstname
          lastname
          email
        }
      }
    `)

    const users = computed(() => result.value?.users)

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

    <button
      @click="refetch({ search: 'some search input' })"
    >
      Search "some search input"
    </button>
  </ul>
</template>
```

::: warning
If you provide new values for **some** of your original query's variables but not **all** of them, `refetch` uses each omitted variable's original value.
:::

## Event hooks

`useQuery` returns event hooks allowing you to execute code when a specific event occurs.

### onResult

This is called whenever a new result is available.

```js
const { onResult } = useQuery(/* ... */)

onResult((queryResult) => {
  console.log(queryResult.data)
  console.log(queryResult.loading)
  console.log(queryResult.networkStatus)
  console.log(queryResult.stale)
})
```

You can pass the `notifyOnNetworkStatusChange` option to force the query to trigger a new result when the network status or error is updated:

```js
useQuery(gql`
  ...
`, null, {
  notifyOnNetworkStatusChange: true,
})
```

### onError

It is triggered when an error occurs:

```js
const { onError } = useQuery(/* ... */)

onError((error) => {
  console.log(error.graphQLErrors)
  console.log(error.networkError)
})
```

You can use the `logErrorMessages` function from the `@vue/apollo-util` package to format the error in the browser console:

```js
import { logErrorMessages } from '@vue/apollo-util'

const { onError } = useQuery(/* ... */)

onError((error) => {
  logErrorMessages(error)
})
```

Example error:

![Error log screenshot](/error-log.jpeg)

If you are using Webpack or Vue CLI, it's a good idea to only use it in development:

```js
import { logErrorMessages } from '@vue/apollo-util'

const { onError } = useQuery(/* ... */)

onError((error) => {
  if (process.env.NODE_ENV !== 'production') {
    logErrorMessages(error)
  }
})
```

That way it will be dropped when compiling the project for production.

## Lazy query

If you need to wait before starting a query, you can use `useLazyQuery` instead of `useQuery`. It returns an additional `load` function to start querying your API.

Example:

```vue{4,8,16,27}
<script>
import { computed } from 'vue'
import gql from 'graphql-tag'
import { useLazyQuery } from '@vue/apollo-composable'

export default {
  setup () {
    const { result, load } = useLazyQuery(gql`
      query list {
        list
      }
    `)
    const list = computed(() => result.value?.list ?? [])

    return {
      load,
      list,
    }
  },
}
</script>

<template>
  <div class="m-6">
    <button
      class="bg-green-200 rounded-lg p-4"
      @click="load()"
    >
      Load list
    </button>

    <ul class="my-4">
      <li
        v-for="(item, index) of list"
        :key="index"
        class="list-disc ml-6"
      >
        {{ item }}
      </li>
    </ul>
  </div>
</template>
```

### Getting the result

`load()` returns a Promise to the result of the first request if it's the first time the query is activated.

```js
const { result, load, refetch } = useLazyQuery(gql`
  query list {
    list
  }
`)
// ...

async function myLoad() {
  try {
    const result = await load()
  }
  catch (e) {
    // Handle error
  }
}
```

### Refetch lazy query

`load()` returns `false` if it is not the first time the query is activated. You can use this to refetch the query with `refetch()` in case the user clicks on the button again, meaning `load()` returns `false`.

```js
const { result, load, refetch } = useLazyQuery(gql`
  query list {
    list
  }
`)
// ...

function loadOrRefetch() {
  load() || refetch()
}
```
