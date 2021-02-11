# ApolloQuery

Vous pouvez utiliser le composant `ApolloQuery` (ou `apollo-query`) pour avoir des requêtes Apollo observées directement dans vos templates.
Après avoir lu cette page, consultez [la référence API](../../api/apollo-query.md) pour connaître toutes les options disponibles.

## Le gabarit étiqueté `gql`

C'est la méthode recommandée pour utiliser le composant `ApolloQuery`. Il utilise la même syntaxe avec le gabarit étiqueté `gql` que dans les autres exemples :

```vue
<template>
  <ApolloQuery
    :query="gql => gql`
      query MyHelloQuery ($name: String!) {
        hello (name: $name)
      }
    `"
    :variables="{ name }"
  >
    <!-- TODO -->
  </ApolloQuery>
</template>
```

Nous passons une fonction à la prop `query` qui prent le gabarit `gql` en argument, afin de pouvoir le document GraphQL directement.

L'exemple ci-dessus passe également `variables` à la requête en utilisant la prop du même nom.

Dans le slot par défaut d'`ApolloQuery`, vous pouvez accéder à de la donnée concernant la requête observée, comme par exemple l'object `result` :

```vue
<template v-slot="{ result: { loading, error, data } }">
  <!-- Chargement -->
  <div v-if="loading" class="loading apollo">Chargement...</div>

  <!-- Erreur -->
  <div v-else-if="error" class="error apollo">Une erreur est survenue.</div>

  <!-- Résultat -->
  <div v-else-if="data" class="result apollo">{{ data.hello }}</div>

  <!-- Pas de résultat -->
  <div v-else class="no-result apollo">Pas de résultat :(</div>
</template>
```

Voici un exemple complet :

```vue
<script>
export default {
  data () {
    return {
      name: 'Anne'
    }
  }
}
</script>

<template>
  <div>
    <input v-model="name" placeholder="Renseignez votre nom">

    <ApolloQuery
      :query="gql => gql`
        query MyHelloQuery ($name: String!) {
          hello (name: $name)
        }
      `"
      :variables="{ name }"
    >
      <template v-slot="{ result: { loading, error, data } }">
        <!-- Chargement -->
        <div v-if="loading" class="loading apollo">Chargement...</div>

        <!-- Erreur -->
        <div v-else-if="error" class="error apollo">Une erreur est survenue.</div>

        <!-- Résultat -->
        <div v-else-if="data" class="result apollo">{{ data.hello }}</div>

        <!-- Pas de résultat -->
        <div v-else class="no-result apollo">No result :(</div>
      </template>
    </ApolloQuery>
  </div>
</template>
```

### Mise en place du gabarit étiqueté

Si vous n'utilisez pas [vue-cli-plugin-apollo](https://github.com/Akryum/vue-cli-plugin-apollo) (`v0.20.0+`), vous devez configurer [vue-loader](https://vue-loader.vuejs.org) pour transpiler le gabarit étiqueté. `vue-loader` utilise [Bublé](https://buble.surge.sh/guide/) sous le capot pour transpiler le code dans les templates des composants. Nous devons ajouter la transformation `dangerousTaggedTemplateString` à Bublé pour que `gql` fonctionne. Par exemple, avec Vue CLI :

```js
// vue.config.js

module.exports = {
  chainWebpack: config => {
    config.module
      .rule('vue')
      .use('vue-loader')
        .loader('vue-loader')
        .tap(options => {
          options.transpileOptions = {
            transforms: {
              dangerousTaggedTemplateString: true,
            },
          }
          return options
        })
  }
}
```

Dans une configuration Webpack de base, ça ressemblerait à ça :

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: [
          {
            loader: 'vue-loader',
            options: {
              transpileOptions: {
                transforms: {
                  dangerousTaggedTemplateString: true
                }
              }
            }
          }
        ]
      },

      /* D'autres règles... */
    ]
  }
}
```

## Requêter avec des fichiers `gql`

Une façon alternative d'utiliser le composant est de créer des fichirs `.gql` séparés. Ces fichiers doivent être pré-trasnformés avec [graphql-tag](https://github.com/apollographql/graphql-tag#webpack-preprocessing-with-graphql-tagloader).

```vue
<template>
  <ApolloQuery
    :query="require('../graphql/HelloWorld.gql')"
    :variables="{ name }"
  >
    <template v-slot="{ result: { loading, error, data } }">
      <!-- Chargement -->
      <div v-if="loading" class="loading apollo">Chargement...</div>

      <!-- Erreur -->
      <div v-else-if="error" class="error apollo">Une erreur est survenue.</div>

      <!-- Résultat -->
      <div v-else-if="data" class="result apollo">{{ data.hello }}</div>

      <!-- Pas de résultat -->
      <div v-else class="no-result apollo">Pas de résultat :(</div>
    </template>
  </ApolloQuery>
</template>
```

## Opérations de requête

Vous pouvez accéder à l'object de requête intelligent avec le prop de slot `query`. Voici un composant d'exemple qui pagine des données en utilisant `fetchMore` :

```vue
<template>
  <ApolloQuery
    :query="/* requête */"
    :variables="{
      limit: $options.pageSize
    }"
    v-slot="{ result: { loading, error, data }, query }"
  >
    <!-- Affichage des données -->
    <button v-if="hasMore" @click="loadMore(query)">Charger plus</button>
  </ApolloQuery>
</template>

<script>
export default {
  pageSize: 10,

  data: {
    return {
      page: 1,
      hasMore: true
    }
  },

  methods: {
    async loadMore (query) {
      await query.fetchMore({
        variables: {
          offset: this.page++ * this.$options.pageSize
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult || fetchMoreResult.product.length === 0) {
            this.hasMore = false
            return prev
          }
          return Object.assign({}, prev, {
            product: [...prev.product, ...fetchMoreResult.product]
          })
        }
      })
    }
  }
}
</script>
```

Consultez [la référence API](../../api/smart-query.md#methods) pour connaître toutes les méthodes de requête intelligentes.

## Utiliser des fragments

Les fragments sont intéressants pour partager des morceaux de documents GraphQL dans d'autres documents pour récupérer la même donnée de façon uniforme, et éviter de dupliquer du code.

Imaginons que nous avons une requête `GetMessages` avec un champ `messages` qui est un tableau d'objets `Message` :

```graphql
query GetMessages {
  messages {
    id
    user {
      id
      name
    }
    text
    created
  }
}
```

Nous voulons extraire tous les champs de `messages` qui ont le type `Message` dans un fragment, pour pouvoir les réutiliser ailleurs.

D'abord, importez le gabarit `gql` dans le composant :

```js
import gql from 'graphql-tag'
```

Puis, dans la définition du composant, déclarez un nouvel objet `fragments` :

```js
export default {
  fragments: {
    /** TODO */
  }
}
```

Voici à quoi le fragment `message`, qui est appliqué au type `Message`, ressemble :

```graphql
fragment message on Message {
  id
  user {
    id
    name
  }
  text
  created
}
```

Nous pouvons utiliser le gabarit `gql` comme avec les requêtes :

```js
export default {
  fragments: {
    message: gql`
      fragment message on Message {
        id
        user {
          id
          name
        }
        text
        created
      }
    `
  }
}
```

Dans notre composant, nous pouvons maintenant accéder au fragment grâce à `this.$options.fragments.message`. Pour utiliser ce fragmnt dans notre requête `GetMessages`, nous devons utiliser la syntaxe de décomposition de GraphQL (`...`), ainsi que d'ajouter le fragment avec la requête :

```js
gql`
  query GetMessages {
    messages {
      ...message
    }
  }
  ${$options.fragments.message}
`
```

Cela produira le document GraphQL (que vous pouvez essayer dans l'environnement de test de GraphQL de votre API) :

```graphql
query GetMessages {
  messages {
    ...message
  }
}
fragment message on Message {
  id
  user {
    id
    name
  }
  text
  created
}
```

Que se passe-t-il ici ? GraphQL trouve l'opérateur `...` où l'on sélectionne des champs dans le champ `messages` à l'intérieur de notre requête. L'opérateur `...` est suivi par le nom du fragment, `message`, qui est ensuite recherché dans tout le document GraphQL. Nous avons correctement défini le fragment, que nous trouvons juste après la requête. Enfin, GraphQL copie tout le contenu du fragment et remplace `...message` avec.

On obtient la requête finale :

```graphql
query GetMessages {
  messages {
    id
    user {
      id
      name
    }
    text
    created
  }
}
fragment message on Message {
  id
  user {
    id
    name
  }
  text
  created
}
```

Voici le composant d'exemple complet :

```vue
<!-- MessageList.vue -->
<script>
import gql from 'graphql-tag'

export default {
  fragments: {
    message: gql`
      fragment message on Message {
        id
        user {
          id
          name
        }
        text
        created
      }
    `
  }
}
</script>

<template>
  <ApolloQuery
    :query="gql => gql`
      query GetMessages {
        messages {
          ...message
        }
      }
      ${$options.fragments.message}
    `"
  >
    <!-- Contenu... -->
  </ApolloQuery>
</template>
```

### Réutiliser le fragment

Nous pouvons désormais récupérer le fragment `message` dans d'autres composants :

```vue
<!-- MessageForm.vue -->
<script>
import gql from 'graphql-tag'
import MessageList from './MessageList.vue'

export default {
  methods: {
    async sendMessage () {
      await this.$apollo.mutate({
        mutation: gql`
          mutation SendMessage ($input: SendMessageInput!) {
            addMessage (input: $input) {
              newMessage {
                ...message
              }
            }
          }
          ${MessageList.fragments.message}
        `,
        variables: {
          /* Variables */
        },
        /* Autres options */
      })
    }
  }
}
</script>
```
