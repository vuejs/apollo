
# Options spéciales

Les options spéciales commencent par un `$` dans l'objet `apollo`.

- `$skip` pour désactiver toutes les requêtes et souscriptions (voir ci-dessous)
- `$skipAllQueries` pour désactiver toutes les requêtes (voir ci-dessous)
- `$skipAllSubscriptions` pour désactiver toutes les souscriptions (voir ci-dessous)
- `$deep` pour observer les propriétés ci-dessus avec `deep: true` quand une fonction est fournie
- `$error` pour intercepter les erreurs dans un fonction de gestion par défaut (voir les options avancées d'`error` pour les requêtes intelligentes)
- `$query` pour appliquer les options par défaut à toutes les requêtes d'un composant

Exemple :

```vue
<script>
export default {
  data () {
    return {
      loading: 0,
    }
  },
  apollo: {
    $query: {
      loadingKey: 'loading',
    },
    query1: { ... },
    query2: { ... },
  },
}
</script>
```

Vous pouvez définir un ensemble d'options par défaut dans le provider Apollo afin d'appliquer les définitions `apollo`. Par exemple :

```js
const apolloProvider = new VueApollo({
  defaultClient: apolloClient,
  defaultOptions: {
    // Les options Apollo appliquées à toutes les requêtes dans les composants
    $query: {
      loadingKey: 'loading',
      fetchPolicy: 'cache-and-network',
    },
  },
})
```

## Tout sauter

Vous pouvez désactiver toutes les requêtes d'un composant avec `skipAllQueries`, toutes les souscriptions avec `skipAllSubscriptions`, et les deux `skipAll`:

```js
this.$apollo.skipAllQueries = true
this.$apollo.skipAllSubscriptions = true
this.$apollo.skipAll = true
```

Vous pouvez aussi déclarer ces propriétés dans l'option `apollo` du composant. Ils peuvent prendre des booléens :

```js
apollo: {
  $skipAll: true
}
```

Ou bien des fonctions réactives :

```js
apollo: {
  $skipAll () {
    return this.foo === 42
  }
}
```
