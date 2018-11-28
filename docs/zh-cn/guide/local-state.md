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
  mounted() {
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

[示例项目](https://codesandbox.io/s/zqqj82396p) (感谢 @chriswingler)

[Todo App](https://codesandbox.io/s/x2jr96r8pp) (感谢 @NikkitaFTW)

---