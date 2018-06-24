# Local state

If you need to manage local data, you can do so with [apollo-link-state](https://github.com/apollographql/apollo-link-state) and the `@client` directive:

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
    // mutate the hello message
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

[Example project](https://codesandbox.io/s/zqqj82396p) (thx @chriswingler)

---