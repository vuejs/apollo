# Qué son los Apollo components?

Estos son componentes como cualquier otro. Ellos toman un documento GraphQL en su prop y usan [scoped slot feature](https://vuejs.org/v2/guide/components-slots.html#Scoped-Slots) para pasar los resultados.

El beneficio es que puede usar esos componentes en la plantilla directamente en lugar de usar la opción `apollo` de su componente. En algunos casos ni siquiera necesita agregar una parte del script en su `.vue`! Esto es aún más declarativo.

Aquí un ejemplo sencillo:

```vue
<template>
  <div class="users-list">
    <!-- Apollo Query -->
    <ApolloQuery :query="require('@/graphql/users.gql')">
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
  </div>
</template>

<!-- No need for script -->

<style scoped>
.user {
  list-style: none;
  padding: 12px;
  color: blue;
}
</style>
```
