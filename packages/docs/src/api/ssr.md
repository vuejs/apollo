# ApolloSSR

## Usage

See [SSR guide](../guide-advanced/ssr.md).

## Methods

### getStates

Returns the apollo stores states as JavaScript objects.

```js
const states = ApolloSSR.getStates(clientsObject, options)
```

`options` defaults to:

```js
const defaultOptions = {
  // Prefix for the keys of each apollo client state
  exportNamespace: '',
}
```

### exportStates

Returns the apollo stores states as JavaScript code inside a String. This code can be directly injected to the page HTML inside a `<script>` tag.

```js
const js = ApolloSSR.exportStates(clientsObject, options)
```

`options` defaults to:

```js
const defaultOptions = {
  // Global variable name
  globalName: '__APOLLO_STATE__',
  // Global object on which the variable is set
  attachTo: 'window',
  // Prefix for the keys of each apollo client state
  exportNamespace: '',
  // By default we use sanitize js library to prevent XSS
  //  pass true here will perform a standard JSON.stringify on the states
  useUnsafeSerializer: false,
}
```
