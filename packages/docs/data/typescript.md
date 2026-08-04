# TypeScript

GraphQL's type system pairs naturally with TypeScript. Together they give you end-to-end type safety from your schema to your Vue components.

## GraphQL Codegen (recommended)

[GraphQL Code Generator](https://the-guild.dev/graphql/codegen) with the client preset generates TypeScript types directly from your schema. It works seamlessly with Apollo Client's [data masking](/data/data-masking) feature.

### Installation

::: code-group

```bash [npm]
npm install -D @graphql-codegen/cli @graphql-codegen/client-preset
npm install @graphql-typed-document-node/core
```

```bash [pnpm]
pnpm add -D @graphql-codegen/cli @graphql-codegen/client-preset
pnpm add @graphql-typed-document-node/core
```

```bash [yarn]
yarn add -D @graphql-codegen/cli @graphql-codegen/client-preset
yarn add @graphql-typed-document-node/core
```

:::

### Configuration

Create `codegen.ts` at the root of your project:

```ts twoslash
import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: '<URL_OR_PATH_TO_YOUR_SCHEMA>',
  documents: 'src/**/*.vue',
  importExtension: '.ts',
  generates: {
    'src/graphql/': {
      preset: 'client',
      presetConfig: {
        fragmentMasking: false,
      },
      config: {
        customDirectives: {
          apolloUnmask: true,
        },
        inlineFragmentTypes: 'mask',
        useTypeImports: true,
        enumAsConst: true,
      },
    },
  },
}
export default config
```

Add the script to your `package.json`:

```json
{
  "scripts": {
    "codegen": "graphql-codegen"
  }
}
```

Run codegen:

::: code-group

```bash [npm]
npm run codegen
```

```bash [pnpm]
pnpm codegen
```

```bash [yarn]
yarn codegen
```

:::

### Watch mode

To regenerate types whenever your GraphQL documents change:

::: code-group

```bash [npm]
npm run codegen -- --watch
```

```bash [pnpm]
pnpm codegen --watch
```

```bash [yarn]
yarn codegen --watch
```

:::

Watch mode needs `@parcel/watcher` as a dev dependency:

::: code-group

```bash [npm]
npm install -D @parcel/watcher
```

```bash [pnpm]
pnpm add -D @parcel/watcher
```

```bash [yarn]
yarn add -D @parcel/watcher
```

:::

### Usage

Import the `graphql` function from the generated output and define your queries inline:

:::: composition-api
```vue
<script setup lang="ts">
import { useQuery } from '@vue/apollo-composable'
import { graphql } from '@/graphql'

const { projectId } = defineProps<{ projectId: string }>()

const { current } = useQuery(graphql(`
  query GetProject($projectId: ID!) {
    project(id: $projectId) {
      __typename
      id
      name
      tasks {
        __typename
        id
        title
        ...TaskCard
      }
    }
  }
`), {
  variables: {
    projectId: () => projectId,
  },
})
</script>

<template>
  <div v-if="current.loading">
    Loading...
  </div>
  <div v-else-if="current.error">
    Error: {{ current.error.message }}
  </div>
  <div v-else-if="current.resultState === 'complete'">
    <h1>{{ current.result.project.name }}</h1>
    <TaskCard
      v-for="task in current.result.project.tasks"
      :key="task.id"
      :task="task"
    />
  </div>
</template>
```
::::

:::: components-api
```vue
<script setup lang="ts">
import { ApolloQuery } from '@vue/apollo-components'
import { graphql } from '@/graphql'

const { projectId } = defineProps<{ projectId: string }>()

const GetProject = graphql(`
  query GetProject($projectId: ID!) {
    project(id: $projectId) {
      __typename
      id
      name
      tasks {
        __typename
        id
        title
        ...TaskCard
      }
    }
  }
`)
</script>

<template>
  <ApolloQuery :query="GetProject" :variables="{ projectId }">
    <template #loading>
      Loading...
    </template>
    <template #error="{ error }">
      Error: {{ error.message }}
    </template>
    <template #data="{ data }">
      <h1>{{ data.project.name }}</h1>
      <TaskCard v-for="task in data.project.tasks" :key="task.id" :task="task" />
    </template>
  </ApolloQuery>
</template>
```

The components are generic SFCs, so `TData` and `TVariables` flow from the `query` prop into
the slot props and the event payloads. Passing the wrong `variables` shape is a type error,
and `data.project` is checked against the document.

::: warning Import the components, do not register them globally
Global registration erases the generics, and every slot prop falls back to `any`. The same
applies to a plain `DocumentNode` with no type parameters: annotate it, or generate it, to
keep inference.
:::
::::

The `graphql()` function:

- Parses your GraphQL document at build time.
- Returns a `TypedDocumentNode` with full type inference.
- Automatically includes fragment definitions.

### Enabling data masking types

By default, Apollo Client does not modify operation types regardless of whether they are masked or unmasked. To make GraphQL Codegen's masking types match runtime behavior, augment Apollo Client's `TypeOverrides`:

```ts
import type { GraphQLCodegenDataMasking } from '@apollo/client/masking'
// This import keeps the rest of @apollo/client's types available.
import '@apollo/client'

declare module '@apollo/client' {
  interface TypeOverrides extends GraphQLCodegenDataMasking.TypeOverrides {}
}
```

Place this file (for example `apollo-client.d.ts`) somewhere your `tsconfig.json` `include` covers. With the augmentation in place:

- Masked types omit fields from spread fragments.
- The `@unmask` directive correctly unmasks types.
- `FragmentType` works for type-safe fragment props.

### Type-safe fragments

Use `FragmentType` from `@apollo/client` to type component props that receive fragment data:

:::: composition-api
```vue
<script setup lang="ts">
import type { FragmentType } from '@apollo/client'
import { useFragment } from '@vue/apollo-composable'
import { graphql } from '@/graphql'

const { task } = defineProps<{
  task: FragmentType<typeof TaskCardFragment>
}>()

const TaskCardFragment = graphql(`
  fragment TaskCard on Task {
    __typename
    id
    title
    status
    assignee {
      name
    }
  }
`)

const { current } = useFragment(() => ({
  fragment: TaskCardFragment,
  from: () => task,
}))
</script>

<template>
  <div v-if="current.complete" class="task-card">
    <h3>{{ current.result.title }}</h3>
    <span class="status">{{ current.result.status }}</span>
    <span v-if="current.result.assignee" class="assignee">
      {{ current.result.assignee.name }}
    </span>
  </div>
</template>
```

This pattern:

- Uses `FragmentType` so the parent must pass a correctly-typed fragment reference.
- Uses `useFragment` to read the fragment from the cache.
- Works with [Data Masking](/data/data-masking) for isolated component data.
::::

:::: components-api
```vue
<script setup lang="ts">
import type { FragmentType } from '@apollo/client'
import { ApolloFragment } from '@vue/apollo-components'
import { graphql } from '@/graphql'

const { task } = defineProps<{
  task: FragmentType<typeof TaskCardFragment>
}>()

const TaskCardFragment = graphql(`
  fragment TaskCard on Task {
    __typename
    id
    title
    status
    assignee {
      name
    }
  }
`)
</script>

<template>
  <ApolloFragment :fragment="TaskCardFragment" :from="task">
    <template #data="{ data }">
      <div class="task-card">
        <h3>{{ data.title }}</h3>
        <span class="status">{{ data.status }}</span>
        <span v-if="data.assignee" class="assignee">
          {{ data.assignee.name }}
        </span>
      </div>
    </template>
  </ApolloFragment>
</template>
```

This pattern:

- Uses `FragmentType` so the parent must pass a correctly-typed fragment reference.
- Reads the fragment from the cache with [`<ApolloFragment>`](/api/components/ApolloFragment),
  whose `from` prop takes the masked object straight from the prop.
- Renders `#data` only when every field is present, so `data` is the complete fragment type
  rather than a partial one. `#incomplete` covers the rest.
- Works with [Data Masking](/data/data-masking) for isolated component data.
::::

## Result shapes

The table below shows what each composable returns:

| Composable | `current` ref (discriminated union) | Individual refs |
|------------|-------------|------|
| `useQuery` | `result`, `resultState`, `loading`, `networkStatus`, `error`, `partial` | `result`, `loading`, `networkStatus`, `error` |
| `useLazyQuery` | Same as `useQuery` (inherits) | Same as `useQuery`, plus `load()` |
| `useFragment` | `result`, `resultState`, `complete`, `missing` | `result`, `resultState`, `complete`, `missing` |
| `useMutation` | not provided | `result`, `loading`, `called`, `error` |
| `useSubscription` | not provided | `result`, `loading`, `error`, `variables` |

For `useQuery`, `useLazyQuery`, and `useFragment` we recommend reading from `current` because the `resultState` discriminator narrows the type of `result`:

```ts
const { current } = useQuery(GET_USERS)

if (current.value.resultState === 'complete') {
  // current.value.result is now fully typed as TData
  console.log(current.value.result.users)
}
```

The individual refs remain available for code that only reads `loading` or `error` without accessing `result`.

For `useMutation` and `useSubscription` the discriminated union is not provided because their results do not have multiple data states.

:::: components-api
::: tip Where the components fit
The components hand these same shapes to their slots. `#data` types its `data` as the
`'complete'` branch, but it renders for `partial` and `streaming` too, so the default slot
is the one that narrows honestly: it receives the whole `current` union and the rules in
the next section apply verbatim inside `v-slot`. A template ref gets the "individual refs"
column with the refs unwrapped.
:::
::::

## Type narrowing with `resultState`

The `resultState` discriminator narrows `result` precisely. The states for `useQuery`:

| State | Description | `result` Type |
|-------|-------------|---------------|
| `'complete'` | Data fully satisfies the query | `TData` |
| `'partial'` | Partial data from cache (with `returnPartialData: true`) | `DeepPartial<TData>` |
| `'streaming'` | Data streaming via `@defer` or `@stream` | `TData` |
| `'empty'` | No data yet | `undefined` |

:::: composition-api
```ts
const { current } = useQuery(GET_USERS, { returnPartialData: true })

if (current.value.resultState === 'complete') {
  // TData
}
else if (current.value.resultState === 'partial') {
  // DeepPartial<TData>
}
else if (current.value.resultState === 'streaming') {
  // TData (still arriving)
}
```
::::

:::: components-api
The default slot receives the same discriminator, so the narrowing happens in the template:

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'

declare const GetUsers: TypedDocumentNode<{ users: { id: string, name: string }[] }, Record<string, never>>
// ---cut---
import { ApolloQuery } from '@vue/apollo-components'
</script>

<template>
  <ApolloQuery
    v-slot="{ result, resultState }"
    :query="GetUsers"
    :options="{ returnPartialData: true }"
  >
    <ul v-if="resultState === 'complete'">
      <li v-for="user in result.users" :key="user.id">
        {{ user.name }}
      </li>
    </ul>
    <p v-else-if="resultState === 'partial'">
      {{ result.users?.length ?? 0 }} users cached so far
    </p>
    <p v-else-if="resultState === 'streaming'">
      Still loading the rest...
    </p>
  </ApolloQuery>
</template>
```

Use the default slot whenever the distinction matters. `#data` renders for `'partial'` and
`'streaming'` too, and it types `data` as the complete result in all three cases, so a
partial result reaches it with fields the type claims are there.
::::

For `useFragment` the states are `'complete'` and `'partial'`, and follow the same narrowing pattern.

## Working with variables

TypeScript validates required variables and their types:

:::: composition-api
```ts
// TypeScript Error: Property 'variables' is missing
const { current } = useQuery(GET_USER)

// TypeScript Error: Property 'id' is missing
const { current } = useQuery(GET_USER, { variables: {} })

// OK
const { current } = useQuery(GET_USER, {
  variables: { id: '1' },
})
```

When variables are entirely optional (the query has no required variables), the `variables` option itself is optional.
::::

:::: components-api
```vue-html
<!-- TypeScript Error: Property 'id' is missing -->
<ApolloQuery :query="GetUser" :variables="{}" />

<!-- OK -->
<ApolloQuery :query="GetUser" :variables="{ id: '1' }" />
```

Because `variables` is a prop rather than a required argument, a missing `variables`
altogether is not caught. Everything inside the object is checked, so this only affects the
all-or-nothing case.
::::

## Manual TypedDocumentNode

If you do not use GraphQL Codegen, you can type documents manually with `TypedDocumentNode`:

```ts
import type { TypedDocumentNode } from '@apollo/client'
import { gql } from '@apollo/client'

interface GetUsersQuery {
  users: Array<{ id: string, name: string }>
}

type GetUsersVariables = Record<string, never>

const GET_USERS: TypedDocumentNode<GetUsersQuery, GetUsersVariables> = gql`
  query GetUsers {
    users { id name }
  }
`
```

::: tip Always provide the variables type
For queries with no variables, use `Record<string, never>` so accidental variables produce a type error.
:::

## Next steps

- [Queries](/data/queries) for type-safe queries.
- [Mutations](/data/mutations) for type-safe mutations.
- [Fragments](/data/fragments) for colocated fragment types.
- [Data Masking](/data/data-masking) for isolated component data.
