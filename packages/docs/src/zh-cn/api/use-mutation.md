# useMutation

## 参数

- `document`：包含变更操作的 GraphQL 文档。也可以是一个返回文档的函数。

- `options`：（默认值：`null`）选项对象。也可以是一个返回选项对象的函数。

  - `variables`：变量对象。

  - `awaitRefetchQueries`：默认情况下，`refetchQueries` 在变更 `Promise` 被解决之前不会等待重新获取的查询完成。这确保了查询的重新获取不会阻止对变更响应的处理（查询重新获取是异步处理的）。如果你希望在将变更标记为已解决之前等待重新获取的查询完成，可以将 `awaitRefetchQueries` 设置为 `true`。

  - `clientId`：当提供了多个客户端时，指定该变更使用的客户端 ID。

  - `context`：要传递给连接执行链的上下文。此上下文将仅与变更一起使用，不会被用于 `refetchQueries`。重新获取的查询使用该查询初始化时使用的上下文（因为初始上下文被存储为 `ObservableQuery` 实例的一部分）。如果在重新获取查询时需要特定的上下文，请确保在首次初始化/运行查询时配置了该上下文（通过 `query` `context` 选项）。

  - `errorPolicy`：指定用于当前操作的 `ErrorPolicy`。
    - `none`
    - `all`
    - `ignore`

  - `fetchPolicy`：指定用于当前变更的 `FetchPolicy`。
    - `cache-first`（默认）：从缓存返回结果。仅当无法获得缓存结果时才从网络获取。
    - `cache-and-network`：首先从缓存中返回结果（如果存在），然后在网络可用时返回网络结果。
    - `cache-only`：从缓存返回结果（如果可用），否则失败。
    - `network-only`：从网络返回结果并保存到缓存，如果网络调用未成功则失败。
    - `no-cache`：从网络返回结果但不保存到缓存，如果网络调用未成功则失败。

  - `optimisticResponse`：表示在服务器实际返回结果之前，被乐观地存储为当前变更结果的对象。通常被用于乐观 UI 中，我们希望能够立即看到变更的结果，并在以后出现任何错误时更新 UI。

  - `refetchQueries`：当前变更返回结果后，需要重新获取的查询名称列表。如果你有一组可能会受到变更影响且必须更新的查询，通常会使用此方法。与其为此编写变更查询归纳器（即 `updateQueries`），不如直接重新获取将受到影响的查询并在这些查询返回后实现一致的存储。

  - `update`：在一个变更的生命周期中，该函数将被调用两次。如果提供了 `optimisticResponse` 则在一开始就调用一次。在第二次调用该函数之前，即变更成功解决时，从乐观数据创建的写入将被回滚。在这一时间点将使用实际的变更结果调用 update，且不会回滚这些写入。

    提供 `DataProxy` 而不是让用户直接在 `ApolloClient` 上调用方法的原因是，所有的写入都是在 update 结束时被批处理执行，并且允许对乐观数据生成的写入进行回滚。

    请注意，由于此功能是用于更新存储，因此不能与 `no-cache` 获取策略一起使用。如果你有兴趣在完成变更后执行某些操作，并且不需要更新存储，请改用从 `mutate` 返回的 `Promise`。

  - `updateQueries`：一个 `MutationQueryReducersMap`，它是从查询名称到变更查询归纳器的映射。简而言之，此映射定义了如何将变更的结果合并到应用当前正在侦听的查询结果中。

## 返回值

- `mutate(variables, overrideOptions)`：使用此函数调用变更。

- `loading`：布尔值 `Ref`，跟踪变更的进度。

- `error`：Error `Ref`，保存任何发生的错误。

- `called`：布尔值 `Ref` ，如果变更已经被调用过，则保持为 `true`。

- `onDone`：变更成功完成时调用的事件钩子。

- `onError`：发生错误时调用的事件钩子。
