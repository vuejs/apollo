[@vue/apollo-composable](../../../../index.md) / [useSubscription](../index.md) / Result

# Interface: Result

Result returned by useSubscription.

## 1. Operation data

### error

> **error**: [`Ref`](https://vuejs.org/api/reactivity-core.html#ref)\<`ErrorLike` \| `undefined`\>

A runtime error with `graphQLErrors` and `networkError` properties.

***

### result

> **result**: [`Ref`](https://vuejs.org/api/reactivity-core.html#ref)\<`object` \| `undefined`\>

An object containing the result of your GraphQL subscription. Defaults to `undefined`.

## 2. Network info

### loading

> **loading**: [`Ref`](https://vuejs.org/api/reactivity-core.html#ref)\<`boolean`\>

A boolean that indicates whether any initial data has been returned. `true` until the first subscription event is received.

## 3. Lifecycle

### restart()

> **restart**: () => `Promise`\<`void`\>

Disconnect and reconnect the subscription.

#### Returns

`Promise`\<`void`\>

***

### start()

> **start**: () => `void`

Start the subscription. Has no effect if already active or `enabled` is false.

#### Returns

`void`

***

### stop()

> **stop**: () => `void`

Stop the subscription. Can be restarted by calling [start](#start).

#### Returns

`void`

## 4. Events

### onComplete

> **onComplete**: [`EventHookOn`](https://vueuse.org/shared/createEventHook/#type-declarations)\<`void`\>

Event triggered when the subscription completes.

***

### onError

> **onError**: [`EventHookOn`](https://vueuse.org/shared/createEventHook/#type-declarations)\<`ErrorLike`\>

Event triggered when a subscription error occurs.

***

### onResult

> **onResult**: [`EventHookOn`](https://vueuse.org/shared/createEventHook/#type-declarations)\<`object`\>

Event triggered when subscription data is received.

## 5. Refs

### document

> **document**: [`Ref`](https://vuejs.org/api/reactivity-core.html#ref)\<`DocumentNode`\>

The GraphQL document being subscribed to.

***

### options

> **options**: [`Ref`](https://vuejs.org/api/reactivity-core.html#ref)\<[`Options`](Options.md) \| `undefined`\>

Current options.

***

### variables

> **variables**: [`Ref`](https://vuejs.org/api/reactivity-core.html#ref)\<`OperationVariables`\>

Current variables being sent to the subscription (after debounce/throttle).
