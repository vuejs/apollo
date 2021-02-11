# État local

## Pourquoi utiliser Apollo comme gestionnaire d'état local?

Quand vous faites des requêtes GraphQL abec Apollo, les résultats sont stockés dans le **cache Apollo**. Maintenant, imaginez que vous ayez également besoin d'un état applicatif local et de le mettre à disposition de plusieurs composants. Normalement, dans une application Vue, nous utilisons [Vuex](https://vuex.vuejs.org/) pour ça. Mais utiliser Apollo et Vuex en même temps implique de stocker la donnée à deux endroits différents, ce qui donne lieu à _deux sources de vérité_.

La bonne nouvelle, c'est qu'Apollo a un mécanisme pour stocker l'état applicatif local en cache. Auparavant, il utilisait la bibliothèque [apollo-link-state](https://github.com/apollographql/apollo-link-state) pour cela. Depuis la sortie d'Apollo 2.5, cette fonctionnalité est inclue dans Apollo.

## Créer un schéma local

Tout comme créer un schéma GraphQL est la première étape pour définir un modèle de données sur le serveur, écrire un schéma local est la première étape côté client.

Créons donc un schéma local pour décrire le premier élément d'une liste de tâches à accomplir ("todo"). Cette tâche comporte du texte, une propriété qui détermine si ell est déja achevée, et un identifiant pour distinguer les tâches entre elles. On la représente donc sous la forme d'un objet avec trois propriétés :

```js
{
  id: 'identifiantUnique',
  text: 'Du texte',
  done: false
}
```

Nous sommes maintenant prêts à ajouter un type `Item` à notre schéma GraphQL.

```js
// main.js

import gql from 'graphql-tag';

export const typeDefs = gql`
  type Item {
    id: ID!
    text: String!
    done: Boolean!
  }
`;
```

`qgl` est un gabarit étiqueté qui analyse les requêtes GraphQL.

Nous devons maintenant ajouter `typeDefs` à notre client Apollo.

```js{4-5}
// main.js

const apolloClient = new ApolloClient({
  typeDefs,
  resolvers: {},
});
```

:::warning WARNING
Comme vous pouvez le constater, nous avons également ajouté un objet `resolvers` vide : si nous oublions de l'ajouter dans les options du client Apollo, il ne pourra pas reconnaître les requêtes vers l'état local et tentera de les envoyer à des URLs distants à la place.
:::

## Étendre un schéma GraphQL distant localement

Vous pouvez non seulement créet un schéma local à partir de zéro, mais aussi ajouter des **champs virtuels** locaux à votre schéma distant. Ces champs existent uniquement côté client, et sont parfaits pour injecter de l'état local à votre donnée serveur.

Imaginez que nous ayons un type `User` dans notre schéma distant :

```js
type User {
  name: String!
  age: Int!
}
```

Et que nous souhaitions ajouter une propriété locale à `User` :

```js
export const schema = gql`
  extend type User {
    twitter: String
  }
`;
```

Maintenant, quand vous requêtez un utilisateur, il vous faudra spécifier que le champ `twitter` est local :

```js
const userQuery = gql`
  user {
    name
    age
    twitter @client
  }
`;
```

## Initialiser un cache Apollo

Pour initialiser un cach Apollo dans votre application, vous devez utiliser un constructeur `InMemoryCache`. Tout d'abord, importez-le dans votre fichier principal :

```js{4,6}
// main.js

import ApolloClient from 'apollo-boost';
import { InMemoryCache } from 'apollo-cache-inmemory';

const cache = new InMemoryCache();
```

Nous pouvons maintenant l'ajouter aux options de notre client Apollo :

```js{4}
// main.js

const apolloClient = new ApolloClient({
  cache,
  typeDefs,
  resolvers: {},
});
```

Pour l'instant, le cache est vide. Pour y ajouter des données initiales, nous deevons utiliser la méthode `writeData` :

```js{9-20}
// main.js

const apolloClient = new ApolloClient({
  cache,
  typeDefs,
  resolvers: {},
});

cache.writeData({
  data: {
    todoItems: [
      {
        __typename: 'Item',
        id: 'dqdBHJGgjgjg',
        text: 'test',
        done: true,
      },
    ],
  },
});
```

Nous venons d'ajouter un tableau de `todoItems` à notre cache et nous avons déterminé que chaque élément a un `__typename` nommé `Item` (spécifié dans notre schéma local).

## Requêter de la donnée locale

Requêter le cache local est similaire à [envoyer des requêtes GraphQL à un serveur distant](apollo/queries.md). D'abord, nous devons créer une requête :

```js
// App.vue

import gql from 'graphql-tag';

const todoItemsQuery = gql`
  {
    todoItems @client {
      id
      text
      done
    }
  }
`;
```

La différence principale avec des requêtes distantes est la directive `@client`. Elle spécifie que cette requête ne doit pas être exécutée vers l'API GraphQL distante. À la place, le client Apollo doit récupérer les résultats depuis le cache local.

Nous pouvons maintenant utiliser cette requête dans notre composant Vue comme n'import quelle requête Apollo :

```js
// App.vue

apollo: {
  todoItems: {
    query: todoItemsQuery
  }
},
```

## Changer de la donnée locale avec des mutations

Il existe deux façons différentes de modifier la donnée locale :

- l'écrire directement avec la méthode `writeData` comme nous l'avons fait lors de [l'initialisation du cache](#initializing-an-apollo-cache);
- invoquer une mutation GraphQL.

Ajoutons quelques mutations à notre [schéma GraphQL local](#creating-a-local-schema) :

```js{10-14}
// main.js

export const typeDefs = gql`
  type Item {
    id: ID!
    text: String!
    done: Boolean!
  }

  type Mutation {
    checkItem(id: ID!): Boolean
    addItem(text: String!): Item
  }
`;
```

La mutation `checkItem` inversera la propriété booléenne `done` d'un élément donné. Créons-la en utilisant `gql` :

```js
// App.vue

const checkItemMutation = gql`
  mutation($id: ID!) {
    checkItem(id: $id) @client
  }
`;
```

Nous avons défini une mutation _locale_ (car nous utilisons la directive `@client`) qui accepte un identifiant unique en paramètre. Maintenant, il nous faut un _résolveur_: une fonction qui résout une valeur pour un type ou un champ dans un schéma.


Dans notre cas, le résolveur définit les changements que nous souhaitons apporter à notre cache local Apollo quand nous avons certaines mutations. Les résolveurs locaux ont la même signature que les distants (`(parent, args, context, info) => data`). En réalité, nous aurons uniquement besoin d'`args` (les arguments passés à la mutation) et de `context` (nous aurons besoin de ses propriétés de cache pour lire et écrire de la donnée).

Ajoutons donc un résolveur à notre fichier principal :

```js
// main.js

const resolvers = {
  Mutation: {
    checkItem: (_, { id }, { cache }) => {
      const data = cache.readQuery({ query: todoItemsQuery });
      const currentItem = data.todoItems.find(item => item.id === id);
      currentItem.done = !currentItem.done;
      cache.writeQuery({ query: todoItemsQuery, data });
      return currentItem.done;
    },
};
```

Que se passe-t-il ici ?

1. on lit `todoItemsQuery` depuis notre cache pour voir quelles `todoItems` nous avons;
2. on cherche un élément qui possède un certain identifiant;
3. on inverse la propriété `done` de l'élément récupéré;
4. on écrit nos `todoItems` modifiées en cache;
5. on retourne la propriété `done` comme résultat de mutation.

Nous devons maintenant remplacer notre objet `resolvers` vide avec nos nouveaux `resolvers` dans les options du client Apollo :

```js{17}
// main.js

const resolvers = {
  Mutation: {
    checkItem: (_, { id }, { cache }) => {
      const data = cache.readQuery({ query: todoItemsQuery });
      const currentItem = data.todoItems.find(item => item.id === id);
      currentItem.done = !currentItem.done;
      cache.writeQuery({ query: todoItemsQuery, data });
      return currentItem.done;
    },
};

const apolloClient = new ApolloClient({
  cache,
  typeDefs,
  resolvers,
});
```

Après cela, nous pouvons utiliser notre mutation dans notre composant Vue comme n'importe quelle [mutation](apollo/mutations.md):

```js
// App.vue

methods: {
  checkItem(id) {
    this.$apollo.mutate({
      mutation: checkItemMutation,
      variables: { id }
    });
  },
}
```
