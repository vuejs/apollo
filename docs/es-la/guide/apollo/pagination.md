# Paginación con`fetchMore`

*[Aquí](https://github.com/Akryum/apollo-server-example/blob/master/schema.js#L21) un ejemplo simple para el servidor.*

Algunas veces
 su dataset es tan grande que es posible que quiera cargarlo por partes(chunk by chunk).

Use el método `fetchMore()` en una Smart Query para cargar más data.

::: warning
No se olvide de incluir el `__typename` en el nuevo resultado.

No cambie las variables iniciales devueltas si usa `variables()`, o la data de la lista se perderá.
:::

Ejemplo:

```vue
<template>
  <div id="app">
    <h2>Pagination</h2>
    <div class="tag-list" v-if="tagsPage">
      <div class="tag-list-item" v-for="tag in tagsPage.tags">
        {{ tag.id }} - {{ tag.label }} - {{ tag.type }}
      </div>
      <div class="actions">
        <button v-if="showMoreEnabled" @click="showMore">Show more</button>
      </div>
    </div>
  </div>
</template>

<script>
import gql from 'graphql-tag'

const pageSize = 10

export default {
  name: 'app',
  data: () => ({
    page: 0,
    showMoreEnabled: true,
  }),
  apollo: {
    // Pages
    tagsPage: {
      // GraphQL Query
      query: gql`query tagsPage ($page: Int!, $pageSize: Int!) {
        tagsPage(page: $page, size: $pageSize) {
          tags {
            id
            label
            type
          }
          hasMore
        }
      }`,
      // Variables iniciales
      variables: {
        page: 0,
        pageSize,
      },
    },
  },
  methods: {
    showMore() {
      this.page ++
      // Fetch data y transforma el resultado original
      this.$apollo.queries.tagsPage.fetchMore({
        // New variables
        variables: {
          page: this.page,
          pageSize,
        },
        // Transforma el resultado anterior con nueva data
        updateQuery: (previousResult, { fetchMoreResult }) => {
          const newTags = fetchMoreResult.tagsPage.tags
          const hasMore = fetchMoreResult.tagsPage.hasMore

          this.showMoreEnabled = hasMore

          return {
            tagsPage: {
              __typename: previousResult.tagsPage.__typename,
              // Mergear lista de etiquetas
              tags: [...previousResult.tagsPage.tags, ...newTags],
              hasMore,
            },
          }
        },
      })
    },
  },
}
</script>
```
