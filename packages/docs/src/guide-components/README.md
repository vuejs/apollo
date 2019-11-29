# Introduction

## What are Apollo components?

Those are components just like any others. They take a GraphQL document in their prop and use the [scoped slot feature](https://vuejs.org/v2/guide/components-slots.html#Scoped-Slots) to pass down the results.

The benefit is that you can use those components in the template directly instead of using the `apollo` option of your component. In some cases you don't even need to add a script part at all in your `.vue`! This is all even more declarative.

Here is a quick example of an [ApolloQuery](./query.md) in a template:

```vue
<template>
  <!-- Apollo Query -->
  <ApolloQuery :query="/* some query */">
    <!-- The result will automatically updated -->
    <template slot-scope="{ result: { data, loading } }">
      <!-- Some content -->
      <div v-if="loading">Loading...</div>
      <ul v-else>
        <li v-for="user of data.users" class="user">
          {{ user.name }}
        </li>
      </ul>
    </template>
  </ApolloQuery>
</template>

<!-- No need for script -->
```
