# ApolloSSR

## Usos

Ver [Guía SSR](../guide/ssr.md).

## Métodos

### prefetchAll

Precarga todas las definiciones de los componentes puestos en cola y se devuelve a la promesa resuelta cuando toda la data correspondiente está lista.

```js
await ApolloSSR.prefetchAll (apolloProvider, componentDefs, context)
```

`context` se pasa como argumento a las opciones `prefetch` dentro de las Smart Query. Puede contener la ruta y el store.

### getStates

Devuelve los states de los apollo stores como objetos de JavaScript.

```js
const states = ApolloSSR.getStates(apolloProvider, options)
```

`options` defaults to:

```js
{
  // Prefijo par las keys de cada apollo client state
  exportNamespace: '',
}
```

### exportStates

Devuelve los estados de las tiendas apollo como código JavaScript dentro de un string. Este código se puede inyectar directamente al HTML de la página dentro de una etiqueta `<script>`.
```js
const js = ApolloSSR.exportStates(apolloProvider, options)
```

`options` defaults to:

```js
{
  // Nombre de la variable global
  globalName: '__APOLLO_STATE__',
  // Objeto global donde se setea la variable
  attachTo: 'window',
  // Prefijo para las keys de cada apollo client state
  exportNamespace: '',
}
```
