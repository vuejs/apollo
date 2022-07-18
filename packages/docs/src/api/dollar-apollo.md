# Dollar Apollo

This is the Apollo manager added to any component that uses Apollo. It can be accessed inside a component with `this.$apollo`.

## Properties

- `vm`: related component
- `queries`: object map of the component's Reactive Queries.
- `subscriptions`: object map of the component's Reactive Subscriptions.
- `provider`: injected [Apollo Provider](./apollo-provider.md).
- `loading`: whether at least one query is loading.
- `skipAllQueries`: (setter) boolean to pause or unpause all Reactive Queries.
- `skipAllSubscriptions`: (setter) boolean to pause or unpause all Reactive Subscriptions.
- `skipAll`: (setter) boolean to pause or unpause all Reactive Queries and Reactive Subscriptions.

## Methods

- `query`: execute a query (see [Queries](../guide-option/queries.md)).
- `mutate`: execute a mutation (see [Mutations](../guide-option/mutations.md)).
- `subscribe`: standard Apollo subscribe method (see [Subscriptions](../guide-option/subscriptions.md)).
- `addSmartQuery`: manually add a Reactive Query (not recommended).
- `addSmartSubscription`: add a Reactive Subscription (see [Subscriptions](../guide-option/subscriptions.md)).
- `getClient`: returns the underlying ApolloClient.
