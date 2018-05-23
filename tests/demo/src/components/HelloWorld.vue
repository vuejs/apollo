<template>
  <div class="hello">
    <ApolloQuery :query="require('../graphql/hello.gql')">
      <template slot-scope="{ result: { data, loading } }">
        <div v-if="loading">Loading...</div>
        <div v-else-if="data">{{ data.hello }}</div>
      </template>
    </ApolloQuery>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="stylus">
h3
  margin 40px 0 0

ul
  list-style-type none
  padding 0

li
  display inline-block
  margin 0 10px

a
  color #42b983
</style>
