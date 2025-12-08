[@vue/apollo-composable](../index.md) / useGlobalSubscriptionLoading

# Function: useGlobalSubscriptionLoading()

> **useGlobalSubscriptionLoading**(): `ComputedRef`\<`boolean`\>

Returns a computed ref indicating if any subscription in the entire app is loading.

Can be called anywhere, including outside of setup functions.

## Returns

`ComputedRef`\<`boolean`\>

Computed ref that is `true` when any subscription in the app is connecting.
