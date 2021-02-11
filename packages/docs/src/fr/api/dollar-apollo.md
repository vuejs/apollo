# Dollar Apollo

Il s'agit du gestionnaire Apollo ajouté à chaque composant qui utilise Apollo. Il est possible d'y accéder à l'intérieur d'un composant via `this.$apollo`.

## Propriétés

- `vm`: composant associé.
- `queries`: tableau des requêtes intelligentes du composant.
- `subscriptions`: tableau des souscriptions intelligentes du composant.
- `provider`: [Apollo Provider](./apollo-provider.md) injecté.
- `loading`: si au moins une requête est en cours.
- `skipAllQueries`: (mutateur) booléen pour mettre en pause ou redémarrer toutes les requêtes intelligentes.
- `skipAllSubscriptions`: (mutateur) booléen pour mettre en pause ou redémarrer toutes les souscriptions intelligentes.
- `skipAll`: (mutateur) booléen pour mettre en pause ou redémarrer toutes les requêtes et souscriptions intelligentes.

## Méthodes

- `query`: exécute une requête (consultez [Requêtes](../guide/apollo/queries.md)).
- `mutate`: exécute une mutation (consultez [Mutations](../guide/apollo/mutations.md)).
- `subscribe`: méthode de souscription standard Apollo (consultez [Souscriptions](../guide/apollo/subscriptions.md)).
- `addSmartQuery`: ajouter une requête intelligente manuellement (non recommandé).
- `addSmartSubscription`: ajouter une souscription intelligente manuellement (consultez [Souscriptions](../guide/apollo/subscriptions.md)).
- `getClient`: retourne le client Apollo utilisé.
