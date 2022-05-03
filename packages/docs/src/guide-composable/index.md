# Introduction

The Composition API is an API where you write data and logic in an easily composable way inside the `setup` option.

If you are using Typescript, it is strongly recommended to start using the Composition API as its typing capabilities are unmatched by any other Vue API.

Learn more about the Composition API [here](https://vue-composition-api-rfc.netlify.com/).

Here is an example using this API:

```vue
<script>
export default {
  props: ['userId'],

  setup (props) {
    // Add data and logic here...

    // Expose things to the template
    return {
      props.userId,
    }
  },
}
</script>
```
