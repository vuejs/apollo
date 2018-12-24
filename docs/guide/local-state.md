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
  mounted () {
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

This is an increasly popular way of managing client-side state. Some projects even use it as a replacement of Vuex (or other Flux-inspired solutions).

## Examples

- [Example project](https://codesandbox.io/s/zqqj82396p) (by @chriswingler)
- [Todo App](https://codesandbox.io/s/x2jr96r8pp) (by @NikkitaFTW)

---
