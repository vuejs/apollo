# TypeScript

GraphQL's type system pairs naturally with TypeScript to provide end-to-end type safety from your schema to your Vue components.

## GraphQL Codegen (Recommended)

We recommend using [GraphQL Code Generator](https://the-guild.dev/graphql/codegen) with the client preset to automatically generate TypeScript types from your schema. This works seamlessly with Apollo Client's [data masking](/data/data-masking) feature.

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

Create a `codegen.ts` file at the root of your project:

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

### Watch Mode

For development, you can run codegen in watch mode to automatically regenerate types when your GraphQL documents change:

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

Watch mode requires `@parcel/watcher` as a dev dependency:

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

Import the `graphql` function from the generated output and use it to define your queries inline:

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

The `graphql()` function:
- Parses your GraphQL document at build time
- Returns a `TypedDocumentNode` with full type inference
- Automatically includes fragment definitions

### Enabling Data Masking Types

By default, Apollo Client doesn't modify operation types regardless of whether they are masked or unmasked. To use GraphQL Codegen's masking format with your operation types, you need to tell Apollo Client to use the associated GraphQL Codegen masking types.

Create a TypeScript declaration file (e.g., `apollo-client.d.ts`) in your project:

```ts
import type { GraphQLCodegenDataMasking } from '@apollo/client/masking'
// This import is necessary to ensure all Apollo Client imports
// are still available to the rest of the application.
import '@apollo/client'

declare module '@apollo/client' {
  interface TypeOverrides extends GraphQLCodegenDataMasking.TypeOverrides {}
}
```

This extends Apollo Client's `TypeOverrides` interface with the GraphQL Codegen data masking types, ensuring that:
- Masked types don't include fields from fragment spreads
- The `@unmask` directive properly unmasks types
- `FragmentType` works correctly for type-safe fragment props

::: tip
Make sure TypeScript can find this declaration file. It should be in a location covered by your `tsconfig.json`'s `include` patterns.
:::

### Type-Safe Fragments

Use `FragmentType` from `@apollo/client` to type component props that receive fragment data:

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
- Uses `FragmentType` to ensure the parent passes the correct fragment reference
- Uses `useFragment` to read fragment data from the cache
- Works with [data masking](/data/data-masking) for isolated component data

## Type Narrowing with `resultState`

The `current` ref includes a `resultState` property for type-safe access to data:

| State | Description | `result` Type |
|-------|-------------|---------------|
| `'complete'` | Data fully satisfies the query | `TData` |
| `'partial'` | Partial data from cache | `DeepPartial<TData>` |
| `'streaming'` | Data streaming via `@defer` | `TData` |

```ts
const { current } = useQuery(GET_USERS)

if (current.value.resultState === 'complete') {
  // current.value.result is fully typed
  console.log(current.value.result.users)
}
```

## Working with Variables

TypeScript validates that required variables are provided with correct types:

```ts
// ❌ TypeScript Error: Property 'variables' is missing
const { current } = useQuery(GET_USER_QUERY)

// ❌ TypeScript Error: Property 'id' is missing
const { current } = useQuery(GET_USER_QUERY, { variables: {} })

// ✅ Correct: Required variable provided
const { current } = useQuery(GET_USER_QUERY, {
  variables: { id: '1' },
})
```

## Manual TypedDocumentNode

If you're not using GraphQL Codegen, you can manually type documents with `TypedDocumentNode`:

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

::: tip
Always provide the variables type, even for queries without variables. Use `Record<string, never>` for empty variables to prevent accidentally passing variables.
:::

## Next Steps

- [Queries](/data/queries) - Type-safe queries with Vue Apollo
- [Mutations](/data/mutations) - Type-safe mutations
- [Fragments](/data/fragments) - Colocate types with fragments
- [Data Masking](/data/data-masking) - Isolate component data requirements
