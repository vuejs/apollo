# Server-Side Rendering

## Vue CLI Plugin

He desarrollado un  plugin para [vue-cli](http://cli.vuejs.org) para que usted pueda transformar su app vue-apollo en una app isomórfica SSR en literalmente dos minutos! ✨🚀

En su proyecto de vue-cli 3:

```bash
vue add @akryum/ssr
```

[Más información](https://github.com/Akryum/vue-cli-plugin-ssr)

## "Prefetch" de componentes

A las consultas (queries) a las que quiera hacer "prefetch" en el servidor, agregue la opción `prefetch`. Esto puede ser:
 - El objeto de una variable,
 - Una función que obtiene el objeto de contexto(que puede contener una URL por ejemplo) y devolver el objeto de una variable,
 - `false` para deshabilitar prefetching para esta consulta(query).

Si devuelve un objeto de variables en la opción `prefetch`, asegúrese de que coincida con el resultado de la opción` variables`. Si no coinciden, la propiedad de datos de la consulta no se completará al renderizar la plantilla del lado del servidor.

::: danger
No tiene acceso a la instancia del componente al hacer `prefetching` en el servidor.
:::

Ejemplo:

```js
export default {
  apollo: {
    allPosts: {
      // Esto será "prefetched"
      query: gql`query AllPosts {
        allPosts {
          id
          imageUrl
          description
        }
      }`,
    }
  }
}
```

Ejemplo 2:

```js
export default {
  apollo: {
    post: {
      query: gql`query Post($id: ID!) {
        post (id: $id) {
          id
          imageUrl
          description
        }
      }`,
      prefetch: ({ route }) => {
        return {
          id: route.params.id,
        }
      },
      variables () {
        return {
          id: this.id,
        }
      },
    }
  }
}
```

### Skip prefetching

Ejemplo sin prefetch a la consulta (query):

```js
export default {
  apollo: {
    allPosts: {
      query: gql`query AllPosts {
        allPosts {
          id
          imageUrl
          description
        }
      }`,
      // Sin prefetch
      prefetch: false,
    }
  }
}
```

Si desea omitir "prefetching" todas las consultas para un componente específico, use la opción` $ prefetch`:

```js
export default {
  apollo: {
    // Sin prefetch a ninguna consulta
    $prefetch: false,
    allPosts: {
      query: gql`query AllPosts {
        allPosts {
          id
          imageUrl
          description
        }
      }`,
    }
  }
}
```

También puede poner un atributo `no-prefetch` en cualquier componente, por lo que se ignorará mientras recorre el árbol para recopilar las consultas de Apollo:

```vue
<ApolloQuery no-prefetch>
```

## En el servidor

En la entrada del servidor, debe instalar el complemento `ApolloSSR` en Vue:

```js
import Vue from 'vue'
import ApolloSSR from 'vue-apollo/ssr'

Vue.use(ApolloSSR)
```

Para hacer prefetch a todas las consultas apolo que marcó, use el método` ApolloSSR.prefetchAll`. El primer argumento es `apolloProvider`. El segundo argumento es un array de la definición del componente a incluir (por ejemplo, desde el método `router.getMatchedComponents`). El tercer argumento es el objeto de contexto pasado a los hooks `prefetch` (ver arriba). Se recomienda pasar el objeto ` currentRoute` al vue-router. Devuelve una promesa resuelta cuando se cargan todas las consultas apollo.

Aquí hay un ejemplo con vue-router y Vuex store:

```js
import Vue from 'vue'
import ApolloSSR from 'vue-apollo/ssr'
import App from './App.vue'

Vue.use(ApolloSSR)

export default () => new Promise((resolve, reject) => {
  const { app, router, store, apolloProvider } = CreateApp({
    ssr: true,
  })

  // ubicacion del router
  router.push(context.url)

  // esperar a que el router resuelva async hooks "posibles"
  router.onReady(() => {
    const matchedComponents = router.getMatchedComponents()

    // sin matches
    if (!matchedComponents.length) {
      reject({ code: 404 })
    }

    let js = ''

     // Llama preFetch hooks en los componentes que coinciden con la ruta.
     // Un hook preFetch distribuye una acción al store y devuelve una promesa,
     // que se resuelve cuando la acción está completa y el estado del store ha sido
     // actualizado.

    // Vuex Store prefetch
    Promise.all(matchedComponents.map(component => {
      return component.asyncData && component.asyncData({
        store,
        route: router.currentRoute,
      })
    })
    // Apollo prefetch
    // Hace prefetch a todas las consultas Apollo en toda la app
    .then(() => ApolloSSR.prefetchAll(apolloProvider, [App, ...matchedComponents], {
      store,
      route: router.currentRoute,
    })
    .then(() => {
      // Inyecta el estado de Vuex y el cache de Apollo en la pagina.
      // Esto proviene consultas innecesarias.

      // Vuex
      js += `window.__INITIAL_STATE__=${JSON.stringify(store.state)};`

      // Apollo
      js += ApolloSSR.exportStates(apolloProvider)

      resolve({
        app,
        js,
      })
    }).catch(reject)
  })
})
```

Utilice el método `ApolloSSR.exportStates (apolloProvider, options)` para obtener el código JavaScript que necesita para inyectar en la página generada para pasar los datos del caché apollo al cliente.

Se necesita un argumento `options` que se establece de manera predeterminada en:

```js
{
  // Nombre variable global
  globalName: '__APOLLO_STATE__',
  // Objeto global donde la variable se establece
  attachTo: 'window',
  // Prefijo para las keys de cada estado del apollo client
  exportNamespace: '',
}
```

También puede usar el método `ApolloSSR.getStates (apolloProvider, options)` para obtener el objeto JS en lugar del string del script`.

Se necesita un argumento `options` que se establece de manera predeterminada en:

```js
{
  //  Prefijo para las keys de cada estado del apollo client
  exportNamespace: '',
}
```

### Creaando Apollo Clients

Se recomienda crear los clientes apollo dentro de una función con un argumento `ssr`, que es` true` en el servidor y `false` en el cliente.

Aquí hay un ejemplo:

```js
// src/api/apollo.js

import Vue from 'vue'
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import VueApollo from 'vue-apollo'

// Instalar vue plugin
Vue.use(VueApollo)

// Crear apollo client
export function createApolloClient (ssr = false) {
  const httpLink = new HttpLink({
    // Usar URLs absolutos
    uri: ENDPOINT + '/graphql',
  })

  const cache = new InMemoryCache()

  // Si en el cliente, recupera el estado inyectado 
  if (!ssr) {
    // Si en el cliente, recupera el estado inyectado
    if (typeof window !== 'undefined') {
      const state = window.__APOLLO_STATE__
      if (state) {
        // Si tiene multiples clientes, use `state.<client_id>`
        cache.restore(state.defaultClient)
      }
    }
  }

  const apolloClient = new ApolloClient({
    link: httpLink,
    cache,
    ...(ssr ? {
      // Set en el servidor para optimizar consultas en SSR
      ssrMode: true,
    } : {
      // Temporalmente deshabilita query force-fetching
      ssrForceFetchDelay: 100,
    }),
  })

  return apolloClient
}
```

Ejemplo para el método `CreateApp` común:

```js
import Vue from 'vue'
import VueRouter from 'vue-router'
import Vuex from 'vuex'
import { sync } from 'vuex-router-sync'

import VueApollo from 'vue-apollo'
import { createApolloClient } from './api/apollo'

import App from './ui/App.vue'
import routes from './routes'
import storeOptions from './store'

Vue.use(VueRouter)
Vue.use(Vuex)

function createApp (context) {
  const router = new VueRouter({
    mode: 'history',
    routes,
  })

  const store = new Vuex.Store(storeOptions)

  // sincronizar el router con vuex store.
  // esto registra `store.state.route`
  sync(store, router)

  // Apollo
  const apolloClient = createApolloClient(context.ssr)
  const apolloProvider = new VueApollo({
    defaultClient: apolloClient,
  })

  return {
    app: new Vue({
      el: '#app',
      router,
      store,
      apolloProvider,
      ...App,
    }),
    router,
    store,
    apolloProvider,
  }
}

export default createApp
```

En el cliente:

```js
import CreateApp from './app'

CreateApp({
  ssr: false,
})
```

En el servidor:

```js
import CreateApp from './app'

export default () => new Promise((resolve, reject) => {
  const { app, router, store, apolloProvider } = CreateApp({
    ssr: true,
  })

  // ubicación del router
  router.push(context.url)

  // espera a que el router resuelva asyn hooks "posibles"
  router.onReady(() => {
    // Prefetch, renderizar HTML (ver arriba)
  })
})
```