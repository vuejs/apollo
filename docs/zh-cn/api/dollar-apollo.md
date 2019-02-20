# Dollar Apollo

这是添加到任何使用 Apollo 的组件中的 Apollo 管理器。它可以在一个组件内通过 `this.$apollo` 访问到。

## 属性

- `vm`：关联的组件。
- `queries`：组件的智能查询的数组。
- `subscriptions`：组件的智能订阅的数组。
- `provider`：注入的 [Apollo Provider](./apollo-provider.md)。
- `loading`：是否至少有一个查询正在加载。
- `skipAllQueries`：(setter) 布尔值，用于暂停或取消暂停所有智能查询。
- `skipAllSubscriptions`：(setter) 布尔值，用于暂停或取消暂停所有智能订阅。
- `skipAll`：(setter) 布尔值，用于暂停或取消暂停所有智能查询和智能订阅。

## 方法

- `query`：执行一个查询（详见 [查询](../guide/apollo/queries.md)）。
- `mutate`：执行一个变更（详见 [变更](../guide/apollo/mutations.md)）。
- `subscribe`：标准的 Apollo 订阅方法（详见 [订阅](../guide/apollo/subscriptions.md)）。
- `addSmartQuery`：手动添加一个智能查询（不推荐使用）。
- `addSmartSubscription`：添加一个智能订阅（详见 [订阅](../guide/apollo/subscriptions.md)）。