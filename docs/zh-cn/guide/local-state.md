# 本地状态

如果你需要管理本地数据，你可以使用 [apollo-link-state](https://github.com/apollographql/apollo-link-state) 和 `@client` 指令来实现：

```js
export default {
  apollo: {
    hello: gql`
      query {
        hello @client {
          msg
        }
      }
    `
  },
  mounted () {
    // 变更 hello 消息
    this.$apollo
      .mutate({
        mutation: gql`
          mutation($msg: String!) {
            updateHello(message: $msg) @client
          }
        `,
        variables: {
          msg: 'hello from link-state!'
        }
      })
  }
}
```

用这种方法来管理客户端状态正变得流行起来。有些项目甚至将其用作 Vuex（或其他灵感来源于 Flux 的解决方案）的替代品。

## 示例

- [示例项目](https://codesandbox.io/s/zqqj82396p) (by @chriswingler)
- [Todo App](https://codesandbox.io/s/x2jr96r8pp) (by @NikkitaFTW)
- [Todo App - 扩展](https://codesandbox.io/s/k3621oko23) (by @ScottMolinari fork of @NikkitaFTW's)

---
