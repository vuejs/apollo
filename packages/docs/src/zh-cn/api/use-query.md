# useQuery

## 参数

- `document`：包含查询的 GraphQL 文档。也可以是一个 `Ref` 或是一个返回文档的函数（将会是响应式的）。

- `variables`：（默认值：`null`）变量对象。也可以是一个 `Ref` 、一个响应式对象或是一个返回变量对象的函数。

- `options`：（默认值：`null`）选项对象。也可以是一个 `Ref` 、一个响应式对象或是一个返回选项对象的函数。

  - `clientId`：当提供了多个客户端时，指定使用的客户端 ID。

  - `context`：要传递给连接执行链的上下文。

  - `debounce`：防抖间隔毫秒数。

  - `enabled`：布尔值 `Ref`，用于启用或禁用查询。

  - `errorPolicy`：自定义错误行为。详见 [错误处理](../guide-composable/error-handling)。
    - `none`
    - `all`
    - `ignore`

  - `fetchPolicy`：自定义缓存行为。
    - `cache-first`（默认）：从缓存返回结果。仅当无法获得缓存结果时才从网络获取。
    - `cache-and-network`：首先从缓存中返回结果（如果存在），然后在网络可用时返回网络结果。
    - `cache-only`：从缓存返回结果（如果可用），否则失败。
    - `network-only`：从网络返回结果并保存到缓存，如果网络调用未成功则失败。
    - `no-cache`：从网络返回结果但不保存到缓存，如果网络调用未成功则失败。

  - `metadata`：当前查询在存储中的任意元数据。可用于调试、开发人员工具等场景。

  - `notifyOnNetworkStatusChange`：网络状态更新时是否应在此查询的观察者上触发下一步。

  - `prefetch`：（默认值：`true`）在服务端渲染期间启用服务器上的预取。

  - `pollInterval`：应该从服务器重新进行此查询的时间间隔（以毫秒为单位）。

  - `returnPartialData`：当一个较大的查询无法从缓存中获取完整结果时，允许从缓存中返回不完整的数据，而不是任何内容都不返回。

  - `throttle`：节流间隔毫秒数。

## 返回值

- `result`：结果数据对象。

- `loading`：布尔值 Ref，当订阅正在进行中时为 `true`。

- `error`：Error Ref，保存任何发生的错误。

- `variables`：Ref，保存变量对象。

- `refetch(variables?)`：再次执行查询，可以选择使用新变量。

- `fetchMore(options)`：执行一个查询的变体，以检索要与现有数据合并的其他数据。在 [分页](../guide-composable/pagination) 时非常有用。

- `subscribeToMore(options)`：为查询添加一个订阅，有助于实时添加从服务器接收的新数据。详见 [订阅](../guide-composable/subscription#subscribetomore)。

- `onResult(handler)`：有新结果可用时调用的事件钩子。

- `onError(handler)`：发生错误时调用的事件钩子。
