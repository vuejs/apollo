# useSubscription

## 参数

- `document`：包含订阅的 GraphQL 文档。也可以是一个 `Ref` 或是一个返回文档的函数（将会是响应式的）。

- `variables`：（默认值：`null`）变量对象。也可以是一个 `Ref` 、一个响应式对象或是一个返回变量对象的函数。

- `options`：（默认值：`null`）选项对象。也可以是一个 `Ref` 、一个响应式对象或是一个返回选项对象的函数。

  - `clientId`：当提供了多个客户端时，指定使用的客户端 ID。

  - `debounce`：防抖间隔毫秒数。

  - `enabled`：布尔值 `Ref`，用于启用或禁用查询。

  - `fetchPolicy`：自定义缓存行为。
    - `cache-first`（默认）：从缓存返回结果。仅当无法获得缓存结果时才从网络获取。
    - `cache-and-network`：首先从缓存中返回结果（如果存在），然后在网络可用时返回网络结果。
    - `cache-only`：从缓存返回结果（如果可用），否则失败。
    - `network-only`：从网络返回结果并保存到缓存，如果网络调用未成功则失败。
    - `no-cache`：从网络返回结果但不保存到缓存，如果网络调用未成功则失败。

  - `throttle`：节流间隔毫秒数。

## 返回值

- `result`：结果数据对象。

- `loading`：布尔值 Ref，当订阅正在进行中时为 `true`。

- `error`：Error Ref，保存任何发生的错误。

- `variables`：Ref，保存变量对象。

- `onResult(handler)`：有新结果可用时调用的事件钩子。

- `onError(handler)`：发生错误时调用的事件钩子。

