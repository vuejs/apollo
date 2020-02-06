# Qu'est-ce qu'un composant Apollo ?

Ces composants sont comme les autres. Ils prennnt un document GraphQL en props et utilisent les [slots avec portée](https://vuejs.org/v2/guide/components-slots.html#Scoped-Slots) pour passer les résultats.

L'avantage est que vous pouvez utiliser ces composants directement dans le template au lieu d'utiliser l'option `apollo` de votre composant. Dans certains cas, vous n'avez même pas besoin d'ajouter de script du tout dans votre fichier `.vue` ! C'est encore plus déclaratif.

Voici un rapide exemple d'une [ApolloQuery](./query.md) dans un template :

```vue
<template>
  <!-- Apollo Query -->
  <ApolloQuery :query="/* some query */">
    <!-- Le résultat est rafraîchi automatiquement -->
    <template slot-scope="{ result: { data, loading } }">
      <!-- Du contenu -->
      <div v-if="loading">Chargement...</div>
      <ul v-else>
        <li v-for="user of data.users" class="user">
          {{ user.name }}
        </li>
      </ul>
    </template>
  </ApolloQuery>
</template>

<!-- Pas besoin de script -->
```

Consultez [ApolloQuery](./query.md) pour en savoir plus sur comment écrire des requêtes GraphQL dans le template.
