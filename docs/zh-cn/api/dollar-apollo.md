# Dollar Apollo

This is the Apollo manager added to any component that uses Apollo. It can be accessed inside a component with `this.$apollo`.

## Properties

- `vm`: related component
- `queries`: array of the component's Smart Queries.
- `subscriptions`: array of the component's Smart Subscriptions.
- `client`: current Apollo client for the component.
- `provider`: injected [Apollo Provider](./apollo-provider.md).
- `loading`: whether at least one query is loading.
- `skipAllQueries`: (setter) boolean to pause or unpause all Smart Queries.
- `skipAllSubscriptions`: (setter) boolean to pause or unpause all Smart Subscriptions.
- `skipAll`: (setter) boolean to pause or unpause all Smart Queries and Smart Subscriptions.

## Methods

- `mutate`: execute a mutation (see [Mutations](../guide/apollo/mutations.md)).
- `subscribe`: standard Apollo subscribe method (see [Subscriptions](../guide/apollo/subscriptions.md)).
- `addSmartQuery`: manually add a Smart Query (not recommended).
- `addSmartSubscription`: add a Smart Subscription (see [Subscriptions](../guide/apollo/subscriptions.md)).