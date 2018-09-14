# Local state

Si necesita manejar data local, lo puede hacer con [apollo-link-state](https://github.com/apollographql/apollo-link-state) y la directiva `@client` :

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
    // mutar el mensahe
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

[Ejemplo de Proyecto](https://codesandbox.io/s/zqqj82396p) (gracias a @chriswingler)
[To-do App](https://codesandbox.io/s/x2jr96r8pp) (gracias a @NikkitaFTW)

---
