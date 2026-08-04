# Queries

A GraphQL query is a read request that names exactly the fields you want back. The server answers with a response shaped like the query, so a single round trip fetches what a screen needs and nothing more. Writes go through [mutations](/data/mutations) instead, and live updates through [subscriptions](/data/subscriptions).

Apollo Client does more than send it. Each result is normalized into a cache keyed by entity, so two components asking for the same object share one copy and one request, and a later write to that object updates both.

## Executing a query

:::: composition-api
Call `useQuery` inside `<script setup>` and pass a GraphQL document:

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ dogs: { id: string, breed: string }[] }, {}>
// ---cut---
const { current } = useQuery(gql`
  query GetDogs {
    dogs {
      id
      breed
    }
  }
`)
</script>

<template>
  <div v-if="current.loading">
    Loading...
  </div>
  <div v-else-if="current.error">
    Error: {{ current.error.message }}
  </div>
  <ul v-else-if="current.resultState === 'complete'">
    <li v-for="dog in current.result.dogs" :key="dog.id">
      {{ dog.breed }}
    </li>
  </ul>
</template>
```

`useQuery` returns a `current` ref. Its value is a discriminated union with `result`, `resultState`, `loading`, `networkStatus`, and `error` properties.
::::

:::: components-api
Put `<ApolloQuery>` in your template with a `query` prop, and give it a `#data` slot:

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ dogs: { id: string, breed: string }[] }, Record<string, never>>
// ---cut---
import { ApolloQuery } from '@vue/apollo-components'
</script>

<template>
  <ApolloQuery
    :query="gql`
      query GetDogs {
        dogs {
          id
          breed
        }
      }
    `"
    :empty="data => data.dogs.length === 0"
  >
    <template #loading>
      Loading...
    </template>
    <template #error="{ error }">
      Error: {{ error.message }}
    </template>
    <template #empty>
      No dogs yet.
    </template>
    <template #data="{ data }">
      <ul>
        <li v-for="dog in data.dogs" :key="dog.id">
          {{ dog.breed }}
        </li>
      </ul>
    </template>
  </ApolloQuery>
</template>
```

Inside `#data`, `data` is the query's result type and is never `undefined`. It is typed as
the complete result even when the state is `partial` or `streaming`, though, so when the
difference matters, read the query through the default slot and narrow on `resultState`
instead. See [Using partial data](/data/error-handling#using-partial-data).

The component decides which of the four slots to render.

`#empty` is the one that needs telling what empty means: the `empty` prop is a predicate
over the result, and without it a result is never treated as empty. Leave both out and
`#data` handles the empty case itself.

`#empty` is also the last branch in the chain, so a query that settles with no result, no
error and nothing in flight renders it rather than nothing at all. A `disabled` query is
the exception: it renders nothing.
::::

## Two ways to read the result

:::: components-api
`<ApolloQuery>` renders in one of two modes, chosen by which slots you provide.

**Opinionated mode**, selected by providing `#data`, is the example above. The component
picks a slot for you:

| Slot | Rendered when |
| --- | --- |
| `#empty` | The `empty` prop returns `true` for the current result |
| `#data` | There is a result to show |
| `#error` | The query failed and there is nothing to show |
| `#loading` | The first request is still in flight |

The order is significant, and it is **data-first**: once there is a result, `#data` keeps
rendering through a background refetch and through a *failed* refetch. Showing an error
page over data the user can still read is almost never what you want, so `#error` is
reserved for the case where there is genuinely nothing else to display. A refetch that
fails reaches `#data` through its own `error` slot prop; see
[Error handling](#error-handling).

If you leave a slot out, that branch renders nothing.

**Raw mode**, selected by using only the default slot, hands you the same flattened state
`useQuery` exposes and gets out of the way:

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'

declare const GetDogs: TypedDocumentNode<{ dogs: { id: string, breed: string }[] }, Record<string, never>>
// ---cut---
import { ApolloQuery } from '@vue/apollo-components'
</script>

<template>
  <ApolloQuery v-slot="{ result, resultState, loading }" :query="GetDogs">
    <p v-if="loading">
      Loading...
    </p>
    <ul v-else-if="resultState === 'complete'">
      <li v-for="dog in result.dogs" :key="dog.id">
        {{ dog.breed }}
      </li>
    </ul>
  </ApolloQuery>
</template>
```

The default slot receives every field of [`useQuery.Current`](/api/composable/@vue/namespaces/useQuery/interfaces/Current)
plus `refetch`, `fetchMore`, `updateQuery`, `subscribeToMore`, `start`, `stop` and
`restart`. `resultState` narrows `result` exactly as it does in script.

::: tip The default slot always renders
The default slot is rendered in **both** modes, not as a `v-else` to `#data`. That is what
lets renderless children like [`<ApolloSubscribeToMore>`](/data/subscriptions#subscribing-to-query-updates)
sit inside an `<ApolloQuery>` that also uses `#data`.
:::
::::

:::: composition-api
`useQuery` exposes the same information in two shapes: a single `current` ref containing the discriminated union, and individual refs like `result`, `loading`, `error` that you can destructure separately.

We recommend `current` for any code that reads `result`. The `resultState` field narrows the type of `result`:

```ts twoslash
import { TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ user: { name: string } }, {}>
// ---cut---
const { current } = useQuery(gql`
  query GetUser {
    user { name }
  }
`)

if (current.value.resultState === 'complete') {
  // current.value.result is typed as { user: { name: string } }
  console.log(current.value.result.user.name)
}
```

The individual refs work, but `result.value` is always typed as `TData | undefined` without context. Reading `current` keeps loading, network status, and data narrowing in one place.

The standalone refs (`result`, `loading`, `error`, `networkStatus`) remain available for cases where you only care about one of them and do not need to access `result`.
::::

## Variables

:::: composition-api
Pass variables in the options object:

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'
import { ref } from 'vue'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ dog: { id: string, name: string } }, { breed: string }>
// ---cut---
const breed = ref('bulldog')

const { current } = useQuery(gql`
  query GetDog($breed: String!) {
    dog(breed: $breed) {
      id
      name
    }
  }
`, {
  variables: { breed },
})
</script>
```

When `breed.value` changes, the query re-executes with the new value.

`variables` accepts three shapes:

1. **An object with reactive values per key** (shown above). Each value can be a ref, a getter, or a plain value.
2. **A ref or getter that returns the whole variables object.** Useful when you compute the variables from other reactive state.
3. **A plain object.** Static variables, no reactivity.

**Reading a prop?** Use a getter. A destructured prop is read once, so passing it directly
would freeze the variable at its initial value:

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ dog: { id: string } }, { breed: string }>
// ---cut---
const { breed } = defineProps<{ breed: string }>()

const { current } = useQuery(gql`
  query GetDog($breed: String!) {
    dog(breed: $breed) { id }
  }
`, {
  variables: () => ({ breed }),
})
</script>
```
::::

:::: components-api
Bind variables like any other prop:

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'

declare const GetDog: TypedDocumentNode<{ dog: { id: string, name: string } }, { breed: string }>
// ---cut---
import { ApolloQuery } from '@vue/apollo-components'
import { ref } from 'vue'

const breed = ref('bulldog')
</script>

<template>
  <ApolloQuery :query="GetDog" :variables="{ breed }">
    <template #data="{ data }">
      {{ data.dog.name }}
    </template>
  </ApolloQuery>
</template>
```

When `breed` changes the query re-executes with the new value. You do not need refs or
getters inside the object the way `useQuery` allows.
::::

## Throttle and debounce

For inputs that update rapidly, such as search boxes, sliders and filter panels, `throttle` and `debounce` reduce how often the query re-executes. Use `debounce` to wait for keystrokes to settle, `throttle` to cap the rate. They are mutually exclusive.

:::: composition-api
```ts twoslash
import { TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'
import { ref } from 'vue'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ products: { id: string, name: string }[] }, { term: string }>
const SearchProducts = gql``
// ---cut---
const term = ref('')

const { current } = useQuery(SearchProducts, {
  variables: { term },
  debounce: 300, // wait 300ms after the last change before re-executing
})
```
::::

:::: components-api
```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ products: { id: string, name: string }[] }, { term: string }>
// ---cut---
import { ApolloQuery } from '@vue/apollo-components'
import { ref } from 'vue'

const term = ref('')
</script>

<template>
  <input v-model="term">

  <ApolloQuery
    :query="gql`
      query SearchProducts($term: String!) {
        products(term: $term) {
          id
          name
        }
      }
    `"
    :variables="{ term }"
    :debounce="300"
  >
    <template #loading>
      Searching…
    </template>
    <template #data="{ data }">
      <ul>
        <li v-for="product in data.products" :key="product.id">
          {{ product.name }}
        </li>
      </ul>
    </template>
  </ApolloQuery>
</template>
```
::::

### What `loading` and `pending` mean here

Delaying a request splits "the user changed something" from "a request is in flight", and the two are reported separately:

| Field | `true` when |
| --- | --- |
| `loading` | From the moment new variables are accepted until the results land, **including** the window where the timer has not elapsed |
| `pending` | Only while the timer is running, before the request goes out |
| `networkStatus` | Describes the network alone, and stays `ready` throughout the window |

`loading` covering the delay is the point: a search field shows its spinner on the keystroke rather than 300ms later.

Reach for `pending` when you need the delay itself: request metrics, or a "cancel" affordance that only makes sense before the request is sent.

:::: composition-api
```ts twoslash
import { TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'
import { ref } from 'vue'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ products: { id: string }[] }, { term: string }>
const SearchProducts = gql``
// ---cut---
const term = ref('')

const { current } = useQuery(SearchProducts, {
  variables: { term },
  debounce: 300,
})

// current.loading is true from the keystroke until the results land
// current.pending is true only while the debounce timer is running
```
::::

:::: components-api
`loading` and `pending` both reach the `#data` slot, alongside the data itself:

```vue-html
<template #data="{ data, loading, pending }">
  <!-- loading: true from the keystroke until the results land -->
  <!-- pending: true only while the debounce timer is running -->
</template>
```
::::

Two cases deliberately never report as pending, because no request will follow: variables rebuilt with deeply equal contents, and variables that change and change back before the timer elapses.

### Pair it with `keepPreviousResult`

Debouncing on its own still clears the result the moment new variables are accepted, so the list a user is reading disappears for the length of the delay plus the request. Keeping the previous result closes that gap:

:::: composition-api
```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'
import { ref } from 'vue'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ products: { id: string, name: string }[] }, { term: string }>
const SearchProducts = gql``
// ---cut---
const term = ref('')

const { current } = useQuery(SearchProducts, {
  variables: { term },
  debounce: 300,
  keepPreviousResult: true,
})
</script>

<template>
  <input v-model="term">

  <ul v-if="current.resultState === 'complete'" :class="{ stale: current.isPreviousResult }">
    <li v-for="product in current.result.products" :key="product.id">
      {{ product.name }}
    </li>
  </ul>
  <p v-else-if="current.loading">
    Searching…
  </p>
</template>
```

Without it, every keystroke drops `current.result` back to `undefined` and the template falls through to the loading branch. With it, the old results stay on screen and `isPreviousResult` marks them as stale so you can dim them.
::::

:::: components-api
Add the `keepPreviousResult` prop:

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ products: { id: string, name: string }[] }, { term: string }>
// ---cut---
import { ApolloQuery } from '@vue/apollo-components'
import { ref } from 'vue'

const term = ref('')
</script>

<template>
  <input v-model="term">

  <ApolloQuery
    :query="gql`
      query SearchProducts($term: String!) {
        products(term: $term) {
          id
          name
        }
      }
    `"
    :variables="{ term }"
    :debounce="300"
    keepPreviousResult
  >
    <template #loading>
      Searching…
    </template>
    <template #data="{ data, isPreviousResult }">
      <ul :class="{ stale: isPreviousResult }">
        <li v-for="product in data.products" :key="product.id">
          {{ product.name }}
        </li>
      </ul>
    </template>
  </ApolloQuery>
</template>
```

Without it, `#loading` takes over on every keystroke. With it, `#loading` is only used for the very first search, and `isPreviousResult` marks the stale list so you can dim it.
::::

See [Keeping previous data](#keeping-previous-data) for how a retained result reports itself.

## Caching

Apollo Client caches query results in a normalized in-memory cache. When you execute the same query again with the same variables, the result comes back instantly from the cache.

The cache belongs to the client, not to the composable or the component, so this is
identical for both APIs. Two `<ApolloQuery>` elements with the same query and variables
read the same cache entry, and a mutation that updates it refreshes both.

:::: composition-api
```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ dog: { id: string, photo: string } }, { breed: string }>
// ---cut---
const { breed } = defineProps<{ breed: string }>()

// First call with this breed: hits the network.
// Subsequent calls with the same breed: returns from cache.
const { current } = useQuery(gql`
  query GetDogPhoto($breed: String!) {
    dog(breed: $breed) {
      id
      photo
    }
  }
`, {
  variables: () => ({ breed }),
})
</script>
```
::::

:::: components-api
```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'

declare const GetDogPhoto: TypedDocumentNode<{ dog: { id: string, photo: string } }, { breed: string }>
// ---cut---
import { ApolloQuery } from '@vue/apollo-components'

const { breed } = defineProps<{ breed: string }>()
</script>

<template>
  <!-- First render with this breed hits the network; later ones come from cache. -->
  <ApolloQuery :query="GetDogPhoto" :variables="{ breed }">
    <template #data="{ data }">
      <img :src="data.dog.photo">
    </template>
  </ApolloQuery>
</template>
```
::::

Read [Caching Overview](/caching/overview) to understand cache behavior in depth.

## Loading states

:::: composition-api
`current.loading` is `true` while a request is in flight:

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ data: string }, {}>
const QUERY = gql``
// ---cut---
const { current } = useQuery(QUERY)
</script>

<template>
  <div v-if="current.loading">
    Loading...
  </div>
  <div v-else-if="current.resultState === 'complete'">
    {{ current.result }}
  </div>
</template>
```

`loading` is deliberately a little broader than the network. With `debounce` or `throttle` it also covers the delay before the request goes out, so a spinner appears on the keystroke rather than after the timer. Without either option there is no such window, and `loading` tracks the request alone.

`current.pending` isolates that window, and is only ever `true` when `debounce` or `throttle` is configured. With neither, it is always `false`, so there is nothing to branch on. See [Throttle and debounce](#throttle-and-debounce).

For more granular control, use `current.networkStatus`:

```vue twoslash
<script setup lang="ts">
import { NetworkStatus, TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ data: string }, {}>
const QUERY = gql``
// ---cut---
const { current } = useQuery(QUERY)
</script>

<template>
  <div v-if="current.networkStatus === NetworkStatus.refetch">
    Refetching...
  </div>
</template>
```
::::

:::: components-api
`#loading` renders whenever there is no result to show. That is the first request, and also
every variables change, since the result is cleared unless you set
[`keepPreviousResult`](#keeping-previous-data).

A **refetch** is the exception. The variables have not changed, so the result stays and
`#data` keeps rendering, with the in-flight request reported through the `loading` slot
prop. That lets you dim the list rather than replace it with a spinner:

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'

declare const GetDogs: TypedDocumentNode<{ dogs: { id: string, breed: string }[] }, Record<string, never>>
// ---cut---
import { ApolloQuery } from '@vue/apollo-components'
</script>

<template>
  <ApolloQuery :query="GetDogs">
    <template #loading>
      Loading...
    </template>
    <template #data="{ data, loading, refetch }">
      <ul :class="{ refreshing: loading }">
        <li v-for="dog in data.dogs" :key="dog.id">
          {{ dog.breed }}
        </li>
      </ul>
      <button :disabled="loading" @click="refetch()">
        Refresh
      </button>
    </template>
  </ApolloQuery>
</template>
```

So the two slots split by whether there is anything on screen, not by whether a request is
running: `#loading` when there is nothing, `#data` with `loading: true` when there is.

The `pending` slot prop is only ever `true` when the `debounce` or `throttle` prop is set,
since it isolates that delay. With neither, it is always `false`. See
[Throttle and debounce](#throttle-and-debounce).

For `networkStatus` and the rest of the state, use the default slot or a template ref; see
[Two ways to read the result](#two-ways-to-read-the-result).
::::

For loading indicators that aggregate multiple queries, see [Loading States](/advanced/loading-states).

## Error handling

:::: composition-api
`current.error` contains any error that occurred:

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ data: string }, {}>
const QUERY = gql``
// ---cut---
const { current } = useQuery(QUERY)
</script>

<template>
  <div v-if="current.error" class="error">
    {{ current.error.message }}
  </div>
</template>
```
::::

:::: components-api
The `#error` slot handles the case where the query failed and there is nothing to show. It
receives `refetch`:

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'

declare const GetDogs: TypedDocumentNode<{ dogs: { id: string }[] }, Record<string, never>>
// ---cut---
import { ApolloQuery } from '@vue/apollo-components'
</script>

<template>
  <ApolloQuery :query="GetDogs">
    <template #error="{ error, refetch }">
      <p class="error">
        {{ error.message }}
      </p>
      <button @click="refetch()">
        Try again
      </button>
    </template>
    <template #data="{ data }">
      {{ data.dogs.length }} dogs
    </template>
  </ApolloQuery>
</template>
```

Because slot resolution is data-first, `#error` does **not** render when a query fails while
there is still something on screen: a failed refetch, or a partial result under
`errorPolicy: 'all'`.

Those failures are not hidden, though. `#data` receives an `error` prop of its own, so you
can keep showing the rows and mark them as stale in the same breath:

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'

declare const GetDogs: TypedDocumentNode<{ dogs: { id: string, breed: string }[] }, Record<string, never>>
// ---cut---
import { ApolloQuery } from '@vue/apollo-components'
</script>

<template>
  <ApolloQuery :query="GetDogs">
    <template #data="{ data, error, loading, refetch }">
      <p v-if="error" class="stale-warning">
        Could not refresh: {{ error.message }}
        <button :disabled="loading" @click="refetch()">
          Retry
        </button>
      </p>
      <ul :class="{ stale: error != null }">
        <li v-for="dog in data.dogs" :key="dog.id">
          {{ dog.breed }}
        </li>
      </ul>
    </template>
  </ApolloQuery>
</template>
```

So the two slots divide by whether anything is left to show: `#error` when there is nothing,
`#data` with `error` set when there is. The `@error` event fires either way, which is the
right hook for a toast or for reporting:

```vue-html
<ApolloQuery :query="GetDogs" @error="showToast">
```
::::

For comprehensive error handling (error policies, partial data, classifying error types), see [Error Handling](/data/error-handling).

## Fetch policies

:::: composition-api
`fetchPolicy` controls how the query interacts with the cache:

```ts twoslash
import { TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ data: string }, {}>
const QUERY = gql``
// ---cut---
const { current } = useQuery(QUERY, {
  fetchPolicy: 'network-only',
})
```
::::

:::: components-api
The `fetchPolicy` prop controls how the query interacts with the cache:

```vue-html
<ApolloQuery :query="GetDogs" fetchPolicy="network-only">
```
::::

| Policy | Description |
|--------|-------------|
| `cache-first` | Check cache first. Hit the network only if not cached. **(default)** |
| `cache-and-network` | Return cached data immediately, then fetch from the network and update. |
| `network-only` | Always fetch from the network, but cache the result. |
| `cache-only` | Read from the cache only. Never hit the network. |
| `no-cache` | Always fetch from the network. Do not write to the cache. |

`nextFetchPolicy` lets you switch to a different policy after the first request completes. `initialFetchPolicy` resets to a specific policy when variables change. See [`useQuery.Options`](/api/composable/@vue/namespaces/useQuery/interfaces/Options) for details.

:::: components-api
Only the options worth a prop have one. Everything else goes through the `options` prop,
which takes the full [`useQuery.Options`](/api/composable/@vue/namespaces/useQuery/interfaces/Options)
object:

```vue-html
<ApolloQuery
  :query="GetDogs"
  :options="{ nextFetchPolicy: 'cache-first', errorPolicy: 'all' }"
/>
```

Props and `options` are merged, with props taking precedence, but only where the prop is
actually set. An absent prop leaves the corresponding `options` entry alone rather than
overwriting it with `undefined`, so the two can be combined freely.
::::

## Disabling queries

:::: composition-api
Set `enabled: false` to skip execution until a condition is met:

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ user: { id: string } }, { id: string }>
// ---cut---
const { userId } = defineProps<{ userId?: string }>()

const { current } = useQuery(
  gql`
    query GetUser($id: ID!) {
      user(id: $id) { id }
    }
  `,
  () =>
    userId == null
      ? { enabled: false }
      : { variables: { id: userId } },
)
</script>
```

While `enabled` is `false`, no observable query exists. When `enabled` flips to `true`, the query starts and behaves like any other `useQuery` from that point on.
::::

:::: components-api
Use the `disabled` prop to skip execution until a condition is met:

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'

declare const GetUser: TypedDocumentNode<{ user: { id: string } }, { id: string }>
// ---cut---
import { ApolloQuery } from '@vue/apollo-components'

const { userId } = defineProps<{ userId?: string }>()
</script>

<template>
  <ApolloQuery
    :query="GetUser"
    :variables="{ id: userId! }"
    :disabled="userId == null"
  >
    <template #data="{ data }">
      {{ data.user.id }}
    </template>
  </ApolloQuery>
</template>
```

While `disabled` is `true`, no observable query exists. When it flips to `false`, the query
starts and behaves like any other from that point on.

::: tip `disabled`, not `enabled`
The prop inverts `useQuery`'s `enabled`. Both spellings work: `options: { enabled }` is left
alone when the `disabled` prop is absent.
:::
::::

:::: composition-api
For queries that run in response to a user action (search submit, button click), prefer [`useLazyQuery`](/advanced/lazy-queries) instead.
::::

## Event hooks

:::: composition-api
React to query lifecycle events imperatively:

```ts twoslash
import { TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ data: string }, {}>
const QUERY = gql``
// ---cut---
const { onNextState, onResult, onError } = useQuery(QUERY)

// Fires on every state change (loading, network status, result)
onNextState((state) => {
  console.log('State:', state.resultState, state.loading)
})

// Fires when result data arrives (complete, partial, or streaming)
onResult((data) => {
  console.log('Data received:', data)
})

// Fires when an error occurs
onError((error) => {
  console.error('Query failed:', error)
})
```

`onResult` has three variants you can listen to individually: `onCompleteResult`, `onPartialResult`, and `onStreamingResult`. The plain `onResult` fires for all three.
::::

:::: components-api
Every `useQuery` hook is emitted as a component event:

```vue
<script setup lang="ts">
import type { ErrorLike } from '@apollo/client'
import { ApolloQuery } from '@vue/apollo-components'
import { GetDogs } from './queries'

function report(error: ErrorLike) {
  console.error('Query failed:', error)
}
</script>

<template>
  <ApolloQuery
    :query="GetDogs"
    @result="data => console.log('Data received:', data.dogs.length)"
    @error="report"
    @nextState="state => console.log(state.resultState, state.loading)"
  >
    <template #data="{ data }">
      {{ data.dogs.length }}
    </template>
  </ApolloQuery>
</template>
```

| Event | Fires when |
| --- | --- |
| `@result` | Any result data arrives: complete, partial or streaming |
| `@completeResult` | A complete result arrives |
| `@partialResult` | A partial result arrives |
| `@streamingResult` | A streaming (`@defer`/`@stream`) chunk arrives |
| `@error` | The query errors, including on a refetch over existing data |
| `@nextState` | Any state change at all: loading, network status, result |

::::

## Keeping previous data

:::: composition-api
When variables change, `result` is cleared by default while the new request is in flight. Set `keepPreviousResult: true` to keep showing the previous data until the new data arrives:

```ts twoslash
import { TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'
import { ref } from 'vue'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ data: string }, { id: string }>
const QUERY = gql``
// ---cut---
const id = ref('1')

const { current } = useQuery(QUERY, {
  variables: { id },
  keepPreviousResult: true,
})
// When id changes, current.result keeps the old value
// until the new query completes.
```

This pattern is useful for filters and pagination, where flashing an empty state on every change would be jarring.

A retained result is reported as a normal result: `resultState`, `result` and `partial` all describe the data you are still showing, so narrowing on `resultState === 'complete'` keeps working. `isPreviousResult` tells the two apart, and `loading` describes the request that is on its way to replace it:

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'
import { ref } from 'vue'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ products: { id: string, name: string }[] }, { term: string }>
const SearchProducts = gql``
// ---cut---
const term = ref('')

const { current } = useQuery(SearchProducts, {
  variables: { term },
  keepPreviousResult: true,
})
</script>

<template>
  <ul v-if="current.resultState === 'complete'" :class="{ stale: current.isPreviousResult }">
    <li v-for="product in current.result.products" :key="product.id">
      {{ product.name }}
    </li>
  </ul>
  <p v-else-if="!current.loading">
    No products found.
  </p>
</template>
```

`resultState` describes the data being handed back; `loading`, `networkStatus` and `error` describe the request. Retention only ever changes the former.
::::

:::: components-api
When variables change, the result is cleared by default while the new request is in flight.
For a search field that means `#data` flickering out to `#loading` on every keystroke. Set
`keepPreviousResult` to hold the old list until the new one lands:

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'

declare const SearchProducts: TypedDocumentNode<{ products: { id: string, name: string }[] }, { term: string }>
// ---cut---
import { ApolloQuery } from '@vue/apollo-components'
import { ref } from 'vue'

const term = ref('')
</script>

<template>
  <ApolloQuery
    :query="SearchProducts"
    :variables="{ term }"
    :debounce="300"
    keepPreviousResult
  >
    <template #loading>
      Searching…
    </template>
    <template #data="{ data, isPreviousResult }">
      <ul :class="{ stale: isPreviousResult }">
        <li v-for="product in data.products" :key="product.id">
          {{ product.name }}
        </li>
      </ul>
    </template>
  </ApolloQuery>
</template>
```

`#loading` now only appears for the very first search. Every later one keeps the old list on
screen, marked `isPreviousResult`, until the new one arrives.

A retained result is reported as a normal result: `resultState`, `result` and `partial` all
describe the data you are still showing, so narrowing in the default slot keeps working.
`isPreviousResult` tells the two apart, and `loading` describes the request on its way to
replace it.
::::

## Awaiting the query

`useQuery` returns a `PromiseLike` that resolves when initial data is available. Combined with `<Suspense>`, this gives you a server-rendered initial state and a unified loading fallback:

```vue
<script setup lang="ts">
import { gql } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'

const { current } = await useQuery(gql`
  query GetUsers {
    users { id name }
  }
`)
</script>
```

See [Suspense](/data/suspense) for the full pattern, including SSR and streaming considerations.

:::: components-api
::: warning Composition API only
`<ApolloQuery>` cannot suspend.

Use `await useQuery(...)` in `<script setup>` for the components you want to suspend, and
`<ApolloQuery>` everywhere else. They can appear in the same tree.
:::
::::

## Options and result reference

:::: composition-api
For every available option and method, see:

- [`useQuery.Options`](/api/composable/@vue/namespaces/useQuery/interfaces/Options)
- [`useQuery.Result`](/api/composable/@vue/namespaces/useQuery/interfaces/Result)
::::

:::: components-api
For every prop, event and slot prop, see:

- [`<ApolloQuery>`](/api/components/ApolloQuery)
- [`useQuery.Options`](/api/composable/@vue/namespaces/useQuery/interfaces/Options), for the `options` prop
- [`useQuery.Result`](/api/composable/@vue/namespaces/useQuery/interfaces/Result), for what a template ref exposes
::::

## Next steps

- [Refetching](/data/refetching) re-execute queries on demand or on a schedule.
- [Lazy Queries](/advanced/lazy-queries) run queries in response to user actions.
- [Mutations](/data/mutations) update data and reflect the changes in your queries.
- [Error Handling](/data/error-handling) classify and recover from errors.
