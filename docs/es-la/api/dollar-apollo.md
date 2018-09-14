# Dollar Apollo

Este es el administrador de Apollo agregado a cualquier componente que use Apollo. Se puede acceder dentro de un componente con `this.$Apollo`.

## Propiedades

- `vm`: componente relacionado
- `queries`: array de las consultas inteligentes del componente.
- `subscriptions`: array de componentes inteligentes del Suscripciones.
- `client`: cliente actual de Apollo para el componente.
- `provider`: [Apollo Provider](./apollo-provider.md) inyectado.
- `loading ': si se está cargando al menos una consulta.
- `skipAllQueries`: (setter) booleano para detener o pausar todas las Smart !ueries.
- `skipAllSubscriptions`: (setter) booleano para detener o pausar todas las Smart Subscriptions.
- `skipAll`: (setter) booleano para detener o pausar todas las Smart Queriesy Smart Subscriptions.

## Métodos

- `query`: ejecuta una consulta (ver [Consultas](../guide/apollo/queries.md)).
- `mutate`: ejecuta una mutation (ver [Mutations](../guide/apollo/mutations.md)).
- `subscribe`: Método standard de subscripción Apollo (ver [Subscripciones](../guide/apollo/subscriptions.md)).
- `addSmartQuery`: Añade una Smart Query manualmente  (no recomendado).
- `addSmartSubscription`: Añade una Smart Subscription (ver [Subscripciones](../guide/apollo/subscriptions.md)).