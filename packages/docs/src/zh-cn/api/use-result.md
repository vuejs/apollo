# useResult

## 参数

- `result`：`Ref` 保留来自 Apollo 操作的结果数据。

- `defaultValue`：（默认值：`null`）当数据不可用时使用的默认值。

- `pick`：（默认值：`null`）用于挑选的函数，以数据对象为参数，并应返回一个派生对象。

## 返回值

`useResult` 将返回一个包含从结果数据中挑选的数据的 `Ref`。
