[@vue/apollo-composable](../index.md) / useMutationLoading

# Function: useMutationLoading()

> **useMutationLoading**(): `ComputedRef`\<`boolean`\>

Returns a computed ref indicating if any mutation in the current component is loading.

Must be called inside a setup function.

## Returns

`ComputedRef`\<`boolean`\>

Computed ref that is `true` when any mutation in this component is loading.

## Example

```vue
<script setup>
import { useMutation, useMutationLoading } from '@vue/apollo-composable'

const { mutate: createUser } = useMutation(CreateUser)
const { mutate: updateUser } = useMutation(UpdateUser)

const saving = useMutationLoading()
</script>

<template>
  <button :disabled="saving">
    {{ saving ? 'Saving...' : 'Save' }}
  </button>
</template>
```
