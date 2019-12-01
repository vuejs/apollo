# useApolloClient

## Parameters

- `clientId`: (default: `null`) Id of the client that should be used if you have provided multiple clients.

## Return

- `resolveClient(clientId)`: a function that returns the corresponding `ApolloClient` instance.

## Example

```vue
<script>
import { useApolloClient } from '@vue/apollo-composable'

export default {
  setup () {
    const { resolveClient } = useApolloClient()

    function doSomething () {
      const client = resolveClient()
      // Write to the cache directly
      client.writeQuery({
        query: CURRENT_USER,
        data: {
          currentUser: { ... },
        },
      })
    }
  }
}
</script>
```
