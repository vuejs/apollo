[@vue/apollo-composable](../../../../index.md) / [useSubscription](../index.md) / Options

# Interface: Options

Options for useSubscription.

## 1. Operation options

### errorPolicy?

> `optional` **errorPolicy**: `ErrorPolicy`

Specifies the `ErrorPolicy` to be used for this operation.

***

### variables?

> `optional` **variables**: [`ReactiveVariablesParameter`](../type-aliases/ReactiveVariablesParameter.md)

An object containing all of the GraphQL variables your subscription requires to execute.

## 2. Networking options

### context?

> `optional` **context**: `DefaultContext`

Shared context between your component and your network interface (Apollo Link).

***

### extensions?

> `optional` **extensions**: `Record`\<`string`, `unknown`\>

Extensions to be passed to the subscription.

## 3. Caching options

### fetchPolicy?

> `optional` **fetchPolicy**: `FetchPolicy`

How you want your component to interact with the Apollo cache.

## 4. Vue-Apollo

### clientId?

> `optional` **clientId**: `string`

ID of a named Apollo client to use instead of the default.

***

### debounce?

> `optional` **debounce**: `number`

Debounce variable updates (ms).

***

### enabled?

> `optional` **enabled**: [`MaybeRefOrGetter`](https://vuejs.org/api/utility-types.html#maybereforgetter)\<`boolean`\>

Reactive flag to enable/disable the subscription.

***

### shouldResubscribe?

> `optional` **shouldResubscribe**: `boolean` \| (`options`) => `boolean`

Determines if your subscription should be unsubscribed and subscribed again when an input to the hook (such as `subscription` or `variables`) changes.

#### Default

```ts
true
```

***

### throttle?

> `optional` **throttle**: `number`

Throttle variable updates (ms).
