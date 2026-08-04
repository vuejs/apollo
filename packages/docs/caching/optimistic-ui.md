# Optimistic UI

For many mutations, you can predict the result before the server responds. Apollo Client lets you write that predicted result into the cache immediately so the UI updates without waiting for the network. When the real result arrives, Apollo replaces the optimistic value. If the mutation fails, Apollo rolls the optimistic value back.

:::: components-api
::: tip Reading this page with `<ApolloMutation>`
`optimisticResponse` is a mutation option, so it reaches the component through the `options`
prop, which takes the full
[`useMutation.Options`](/api/composable/@vue/namespaces/useMutation/interfaces/Options)
object. It can also go through the argument to `mutate()` when it depends on what the user
just did:

```vue-html
<ApolloMutation v-slot="{ mutate }" :mutation="UpdateComment" @error="console.error">
  <button @click="mutate({ variables, optimisticResponse })">
    Save
  </button>
</ApolloMutation>
```

`mutate()` takes the same object `useMutation`'s `mutate` does, so every snippet below
transfers unchanged.
:::
::::

## The `optimisticResponse` option

Pass `optimisticResponse` to `mutate` to enable optimistic updates:

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'
import { useMutation } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ updateComment: { __typename: 'Comment', id: string, content: string } }, { commentId: string, commentContent: string }>
// ---cut---
const UPDATE_COMMENT = gql`
  mutation UpdateComment($commentId: ID!, $commentContent: String!) {
    updateComment(commentId: $commentId, content: $commentContent) {
      id
      __typename
      content
    }
  }
`

const { mutate } = useMutation(UPDATE_COMMENT)

function updateComment(commentId: string, commentContent: string) {
  mutate({
    variables: { commentId, commentContent },
    optimisticResponse: {
      updateComment: {
        __typename: 'Comment',
        id: commentId,
        content: commentContent,
      },
    },
  })
}
</script>
```

`optimisticResponse` must match the shape of the mutation result. Include `__typename` and the entity's key field so the cache can identify and update the right object.

## Lifecycle of an optimistic update

1. You call `mutate` with an `optimisticResponse`.
2. Apollo Client writes an optimistic version of the result into the cache. The canonical (real) version is preserved underneath.
3. Every active query that reads the affected entity re-emits with the optimistic data. The UI updates immediately.
4. The server responds.
5. Apollo Client removes the optimistic version and writes the real result over the canonical version.
6. Affected queries re-emit again. If the server response matches the optimistic response, this is invisible to the user.
7. If the mutation fails, the optimistic version is discarded and the canonical cache is left untouched. The UI rolls back automatically.

## Adding a new entity optimistically

For mutations that create new entities (where there is no server-assigned id yet), supply a temporary id:

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'
import { useMutation } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ addTodo: { __typename: 'Todo', id: string, text: string, completed: boolean } }, { text: string }>
declare const GET_TODOS: TypedDocumentNode<{ todos: Array<{ __typename: 'Todo', id: string, text: string, completed: boolean }> }, {}>
// ---cut---
const ADD_TODO = gql`
  mutation AddTodo($text: String!) {
    addTodo(text: $text) {
      __typename
      id
      text
      completed
    }
  }
`

const { mutate } = useMutation(ADD_TODO, {
  update(cache, { data }) {
    if (!data?.addTodo)
      return

    const existing = cache.readQuery({ query: GET_TODOS })
    if (!existing)
      return

    // Avoid duplicates: optimistic and real updates both flow through this callback
    if (existing.todos.some(t => t.id === data.addTodo.id))
      return

    cache.writeQuery({
      query: GET_TODOS,
      data: { todos: [...existing.todos, data.addTodo] },
    })
  },
})

function addTodo(text: string) {
  mutate({
    variables: { text },
    optimisticResponse: {
      addTodo: {
        __typename: 'Todo',
        id: `temp-${Date.now()}`, // Replaced by real id when server responds
        text,
        completed: false,
      },
    },
  })
}
</script>
```

When the server responds with the real todo, its id replaces `temp-<...>` in the cache automatically. The `update` callback fires twice (once with the optimistic data, once with the real data), so guard against duplicate inserts.

## Bailing out conditionally

`optimisticResponse` can be a function that returns the predicted result or the `IGNORE` sentinel to skip the optimistic update entirely:

```ts twoslash
import { TypedDocumentNode } from '@apollo/client'
import { useMutation } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ updateComment: { __typename: 'Comment', id: string, content: string } }, { commentId: string, commentContent: string }>
const UPDATE_COMMENT: TypedDocumentNode<{ updateComment: { __typename: 'Comment', id: string, content: string } }, { commentId: string, commentContent: string }> = gql``
// ---cut---
const { mutate } = useMutation(UPDATE_COMMENT)

function updateComment(commentId: string, commentContent: string) {
  mutate({
    variables: { commentId, commentContent },
    optimisticResponse: (vars, { IGNORE }) => {
      // Skip optimistic update for empty edits
      if (vars.commentContent.length === 0) {
        return IGNORE
      }
      return {
        updateComment: {
          __typename: 'Comment',
          id: vars.commentId,
          content: vars.commentContent,
        },
      }
    },
  })
}
```

## When to use optimistic UI

Use it when:

- The mutation's result is highly predictable (toggles, edits to known fields, simple inserts).
- The user perceives the action as instant in their head, so any visible delay feels broken.
- A failure rollback is acceptable.

Avoid it when:

- The server produces values you cannot predict (auto-generated fields beyond just an id, derived totals, server-side validation).
- A failure rollback would be confusing (financial transactions, "submit and forget" workflows).
- The mutation is rare enough that the network roundtrip is not noticeable.

## Combining with `update`

Optimistic responses and `update` callbacks work together. The `update` callback fires once with the optimistic response and once with the real one. As long as your update logic is idempotent (the duplicate-guard pattern in the example above), the UI shows the optimistic state immediately and reconciles to the real state when the server responds.

For an extra safety net after `update`, see [Refetch after update](/caching/cache-updates#refetch-after-update).

## Next steps

- [Cache Updates](/caching/cache-updates) covers the full set of cache update patterns.
- [Reading & Writing](/caching/interaction) explains the cache methods.
- [Mutations](/data/mutations) for the basics of `useMutation`.
