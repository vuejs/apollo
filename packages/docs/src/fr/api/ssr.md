# ApolloSSR

## Utilisation

Voir le [guide du rendu côté serveur (SSR)](../guide/ssr.md).

## Méthodes

### getStates

Retourne les états des stores Apollo sous forme d'objets.

```js
const states = ApolloSSR.getStates(apolloProvider, options)
```

`options` utilise par défaut :

```js
{
  // Préfixe pour les clés de chaque état du client Apollo
  exportNamespace: '',
}
```

### exportStates

Retourne les états des stores Apollo sous forme de code JavaScript dans une `string`. Ce code peut être injecté directement dans la page HTML dans une balise `<script>`.

```js
const js = ApolloSSR.exportStates(apolloProvider, options)
```

`options` utilise par défaut :

```js
{
  // Nom de la variable globale
  globalName: '__APOLLO_STATE__',
  // Nom de l'objet global sur lequel la variable est attachée
  attachTo: 'window',
  // Préfixe pour les clés de chaque état du client Apollo
  exportNamespace: '',
  // Par défaut, on utilise la bibliothèque Sanitize JS pour éviter les injections XSS
  // Assigner à `true` exécutera un JSON.stringify standard sur le statut
  useUnsafeSerializer: false,
}
```
