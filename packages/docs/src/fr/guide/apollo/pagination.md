# Pagination avec `fetchMore`

*Voici un [exemple simple](https://github.com/Akryum/apollo-server-example/blob/master/schema.js#L21) côté serveur.*

Parfois, il se peut que votre jeu de données soit tellement grand qu'il faille le charger petit à petit.

Vous pouvez utiliser la méthode `fetchMore` sur une requête intelligente pour charger plus de données.

::: warning
N'oubliez pas d'inclure le `__typename` au nouveau résultat.

Ne changez pas les variables retournées initialement lorsque vous utilisez `variables`, ou bien vous pourriez perdre de la donnée dans la liste.
:::

Exemple :

```vue
<template>
  <div id="app">
    <h2>Pagination</h2>
    <div class="tag-list" v-if="tagsPage">
      <div class="tag-list-item" v-for="tag in tagsPage.tags">
        {{ tag.id }} - {{ tag.label }} - {{ tag.type }}
      </div>
      <div class="actions">
        <button v-if="showMoreEnabled" @click="showMore">Voir plus</button>
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
      // Requête GraphQL
      query: gql`query tagsPage ($page: Int!, $pageSize: Int!) {
        tagsPage (page: $page, size: $pageSize) {
          tags {
            id
            label
            type
          }
          hasMore
        }
      }`,
      // Variables initiales
      variables: {
        page: 0,
        pageSize,
      },
    },
  },
  methods: {
    showMore () {
      this.page++
      // Récupération de plus de données et transformation du résultat original
      this.$apollo.queries.tagsPage.fetchMore({
        // Nouvelles variables
        variables: {
          page: this.page,
          pageSize,
        },
        // Transformation du résultat précédent avec de la nouvelle donnée
        updateQuery: (previousResult, { fetchMoreResult }) => {
          const newTags = fetchMoreResult.tagsPage.tags
          const hasMore = fetchMoreResult.tagsPage.hasMore

          this.showMoreEnabled = hasMore

          return {
            tagsPage: {
              __typename: previousResult.tagsPage.__typename,
              // Union des tableaux de libellés
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
