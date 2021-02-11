# Requêtes

Dans GraphQL, une requête est un appel à une API pour récupérer de la donnée. C'est représenté par un *document GraphQL* comme ceci :

```graphql
query myHelloQueryName {
  hello
}
```

Dans l'objet `apollo`, ajoutez un attribut pour chaque propriété à laquelle vous voulez fournir le résultat d'une requête Apollo. Chacune deviendra une requête intelligente.

## Requête simple

Vous pouvez utiliser `gql` pour écrire vos requêtes GraphQL :

```js
import gql from 'graphql-tag'
```

Ajoutez la requête [gql](https://github.com/apollographql/graphql-tag) directement en valeur :

```js
apollo: {
  // Une requête simple qui rafraîchit la propriété Vue 'hello'
  hello: gql`{hello}`,
},
```

Vous pouvez accéder à la requêtes avec `this.$apollo.queries.<name>`.

Vous pouvez initialiser la propriété dans le hook `data` de votre composant Vue :

```js
data () {
  return {
    // Intialiser votre donnée Apollo
    hello: '',
  },
},
```

Côté serveur, ajoutez le schéma et le résolveur correspondants :

```js
export const schema = `
type Query {
  hello: String
}

schema {
  query: Query
}
`

export const resolvers = {
  Query: {
    hello (root, args, context) {
      return 'Hello world!'
    },
  },
}
```

Pour plusz d'informations, consultez la [documentation d'Apollo](https://www.apollographql.com/docs/apollo-server/).

Vous pouvez utiliser votre propriété comme d'habitude dans votre composant Vue :

```vue
<template>
  <div class="apollo">
    <h3>Hello</h3>
    <p>
      {{hello}}
    </p>
  </div>
</template>
```

## Correspondance de noms

Notez qu'une erreur de débutant claqque est d'utiliser un nom de donnée différent du champ dans la requête, par exemple :

```js
apollo: {
  world: gql`query {
    hello
  }`
}
```

Vous remarquez que `world` est différent de `hello`. Vue Apollo ne peut pas deviner quelle donnée vous souhaitez utiliser dans votre composant depuis le résultat de la requête. Par défaut, il essaiera simplemnt le nom que vous utilisez pour la donnée dans le composant (la clé dans l'objet `apollo`), dans notre cas, `world`. Si les noms ne correspondent pas, vous ppuvez utiliser l'option `update` pour dire à Vue Apollo quelle donnée utiliser dans le résultat :

```js
apollo: {
  world: {
    query: gql`query {
      hello
    }`,
    update: data => data.hello
  }
}
```

Vous pouvez également renommer le champ directement dans le document GraphQL :

```js
apollo: {
  world: gql`query {
    world: hello
  }`
}
```

Dans cet exemple, nous renommons le champ `hello` en `world`, pour que Vue Apollo puisse automatiquement inférer ce qu'il doit récupérer depuis le résultat.

## Requête avec des paramètres

Vous pouvez ajouter des variables (et d'autres paramètres) à votre requête `gql` en déclarant `query` et `variables` dans l'objet au lieu de la requête GraphQL :

```js
// Options spécifiques à Apollo
apollo: {
  // Requête avec des paramètres
  ping: {
    // Requête gql
    query: gql`query PingMessage($message: String!) {
      ping(message: $message)
    }`,
    // Paramètres statiques
    variables: {
      message: 'Meow',
    },
  },
},
```

Vous pouvez utiliser les options Apollo `watchQuery` dans l'objet, comme ceci :
 - `fetchPolicy`
 - `pollInterval`
 - ...

Consulter la [documentation d'Apollo](https://www.apollographql.com/docs/react/api/apollo-client/#ApolloClient.watchQuery) pour plus de détails.

Par exemple, vous pouvez ajouter l'option Apollo `fetchPolicy` comme ceci :

```js
apollo: {
  // Requête avec des paramètres
  ping: {
    query: gql`query PingMessage($message: String!) {
      ping(message: $message)
    }`,
    variables: {
      message: 'Meow'
    },
    // Options supplémentaires
    fetchPolicy: 'cache-and-network',
  },
},
```

À nouveau, vous pouvez utiliser votre propriété dans votre composant Vue :

```js
data () {
  return {
    // Initialisation de votre donnée Apollo
    ping: '',
  }
},
```

Côté serveur, ajoutez le schéma et le résolveur correspondants :

```js
export const schema = `
type Query {
  ping(message: String!): String
}

schema {
  query: Query
}
`

export const resolvers = {
  Query: {
    ping (root, { message }, context) {
      return `Réponse à ${message}`
    },
  },
}
```

Et vous pouvez l'utiliser dans votre composant Vue :

```vue
<template>
  <div class="apollo">
    <h3>Ping</h3>
    <p>
      {{ ping }}
    </p>
  </div>
</template>
```

## État de chargement

Vous pouvez afficher un état de chargement grâce à la prop `$apollo.loading` :

```vue
<div v-if="$apollo.loading">Chargement...</div>
```

Ou bien cette requête spécifique `ping` :

```vue
<div v-if="$apollo.queries.ping.loading">Chargement...</div>
```

## Fonction d'options

Vous pouvez utiliser une fonction qui sera appelée quand le composant est créé, et qui retourne l'objet d'options :

```js
// Options spécifiques à Apollo
apollo: {
  // Requête avec des paramètres
  ping () {
    // Appelé lors de la création du composant
    // Doit retourner un objet d'options
    return {
      // Requête gql
      query: gql`query PingMessage($message: String!) {
        ping(message: $message)
      }`,
      // Paramètres statiques
      variables: {
        message: 'Miaou',
      },
    }
  },
},
```

::: tip
Cela fonctionne également pour les [souscriptions](./subscriptions.md).
:::

## Définition de requête réactive

Vous pouvez utiliser une fonction pour l'option `query`. Cela rafraîchira la définition de requête GraphQL automatiquement :

```js
// Le libellé mis en avant peut être soit un libellé au hasard, ou bien le dernier ajouté
featuredTag: {
  query () {
    // Vous pouvez accéder à l'instance du composant avec 'this'
    if (this.showTag === 'random') {
      return gql`{
        randomTag {
          id
          label
          type
        }
      }`
    } else if (this.showTag === 'last') {
      return gql`{
        lastTag {
          id
          label
          type
        }
      }`
    }
  },
  // Nous devons assigner la valeur de la propriété 'featuredTag' du composant
  update: data => data.randomTag || data.lastTag,
},
```

::: tip
Cela fonctionne également pour les [souscriptions](./subscriptions.md).
:::

## Paramètres réactifs

Vous pouvez utiliser une fonction pour rendre les paramètres réactifs avec les propriétés Vue :

```js
// Options spécifiques à Apollo
apollo: {
  // Requête avec des paramètres
  ping: {
    query: gql`query PingMessage($message: String!) {
      ping(message: $message)
    }`,
    // Paramètres réactifs
    variables () {
      // Utilisez des propriétés réactives Vue
      return {
          message: this.pingInput,
      }
    },
  },
},
```

Cela requêtera à nouveau à chaque fois qu'un paramètre change, par exemple :

```vue
<template>
  <div class="apollo">
    <h3>Ping</h3>
    <input v-model="pingInput" placeholder="Saisissez un message" />
    <p>
      {{ping}}
    </p>
  </div>
</template>
```

## Sauter la requête

Si la requête est sautée, elle est désactivée et ne sera plus mise à jour. Vous pouvez utiliser l'options `skip` :

```js
// Options spécifiques à Apollo
apollo: {
  tags: {
    // Requête GraphQL
    query: gql`query tagList ($type: String!) {
      tags(type: $type) {
        id
        label
      }
    }`,
    // Variables réactives
    variables () {
      return {
        type: this.type,
      }
    },
    // Désactivation de la requête
    skip () {
      return this.skipQuery
    },
  },
},
```

Ici, `skip` est appelé automatiquement dès que la propriété `skipSubscription` du composant change.

Vous pouvez aussi accéder à la souscription directemnt et assigner la propriété `skip` :

```js
this.$apollo.queries.tags.skip = true
```

Si la requête `skip` devient `false`, la requête s'exécutera à nouveau automatiquement.

## Exemple de requête réaxctive

Voici un exemple de requête réactive utilisant le *polling* :

```js
// Options spécifiques à Apollo
apollo: {
  // Propriété `tags` sur l'instance Vue
  tags: {
    query: gql`query tagList {
      tags {
        id,
        label
      }
    }`,
    pollInterval: 300, // millisecondes
  },
},
```

Voici à quoi ressemble le serveur :

```js
export const schema = `
type Tag {
  id: Int
  label: String
}

type Query {
  tags: [Tag]
}

schema {
  query: Query
}
`


// Faux générateur de mots
import casual from 'casual'

// Générons quelques libellés
var id = 0
var tags = []
for (let i = 0; i < 42; i++) {
  addTag(casual.word)
}

function addTag (label) {
  let t = {
    id: id++,
    label,
  }
  tags.push(t)
  return t
}

export const resolvers = {
  Query: {
    tags(root, args, context) {
      return tags
    },
  },
}
```

## Éditer une requête intelligente manuellement

Vous pouvez ajouter une requête intelligente manuellement avec la méthode `$apollo.addSmartQuery(key, options)` :

```js
created () {
  this.$apollo.addSmartQuery('comments', {
    // Quelques options comme au-dessus
  })
}
```

::: tip
En interne, cette méthode est appelée pour chaque entrée de l'option `apollo` du composant.
:::

## Options avancées

Il y a encore bien d'autres options spécifiques à Vue Apollo, consultez [la référence API](../../api/smart-query.md).
