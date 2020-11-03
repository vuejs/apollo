# useApolloClient

## 参数

- `clientId`：（默认值：`null`）当提供了多个客户端时，指定使用的客户端 ID。

## 返回值

- `resolveClient(clientId)`：返回相应的 `ApolloClient` 实例的函数。

## 示例

```vue
<script>
import { useApolloClient } from '@vue/apollo-composable'

export default {
  setup () {
    const { resolveClient } = useApolloClient()

    function doSomething () {
      const client = resolveClient()
      // 直接写入缓存
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
