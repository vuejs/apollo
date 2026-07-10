# useLazyQuery（延迟查询）

继承自 [useQuery](./use-query.md)

## 额外返回值（Additional Return）

* `load(document?, variables?, options?)`：一个用于启动查询的函数。如果是**第一次调用该查询**，它将返回 `Promise<Result>`；否则返回 `false`。

### 示例：

```js
const { load, refetch } = useLazyQuery(query, variables, options)

function fetchOrRefetch() {
  load() || refetch()
}

async function waitForLoad() {
  try {
    const result = await load()
    // 使用 result 做一些处理
  }
  catch (error) {
    // 错误处理
  }
}
```
