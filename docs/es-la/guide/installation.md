# Instalación

## Vue CLI Plugin

He desarrollado un plugin para [vue-cli](http://cli.vuejs.org) para agregar Apollo (con un servidor GraphQL opcional!) En literalmente dos minutos! ✨🚀

En todos sus proyectos vue-cli 3:

```bash
vue add apollo
```

Luego puede pasar a la siguiente sección: [Uso básico](./apollo/).

[Más información](https://github.com/Akryum/vue-cli-plugin-apollo)

## Apollo Boost

Apollo Boost es una manera predeterminada para comenzar a usar Apollo Client con "cero configuración". Incluye algunos valores predeterminados, como nuestro recomendado 'InMemoryCache` y `HttpLink`, que vienen configurados por defecto bajo nuestra recomendación y es perfecto para comenzar a desarrollar inmediatamente:

Instalación: 

```
npm install --save vue-apollo graphql apollo-boost
```

O:

```
yarn add vue-apollo graphql apollo-boost
```

### Apollo client

En su app, cree una instancia `ApolloClient` e instale el complemento` VueApollo`:

```js
import Vue from 'vue'
import ApolloClient from "apollo-boost"
import VueApollo from "vue-apollo"

const apolloProvider = new VueApollo({
  defaultClient: new ApolloClient({
    uri: "https://api.graphcms.com/simple/v1/awesomeTalksClone"
  })
})

Vue.use(VueApollo)
```



## Manual

Si desea mayor control instale estos paquetes antes del lado del servidor, agregue apollo a meteor.js antes!.

```
npm install --save vue-apollo graphql apollo-client apollo-link apollo-link-http apollo-cache-inmemory graphql-tag
```

O:

```
yarn add vue-apollo graphql apollo-client apollo-link apollo-link-http apollo-cache-inmemory graphql-tag
```

### Apollo client

En su app, cree una instancia `ApolloClient` e instale el complemento` VueApollo`:

```js
import Vue from 'vue'
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import VueApollo from 'vue-apollo'

const httpLink = new HttpLink({
  // Use un URL absoluto
  uri: 'http://localhost:3020/graphql',
})

// Crear el apollo client
const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  connectToDevTools: true,
})

const apolloProvider = new VueApollo({
  defaultClient: apolloClient,
})

// Instalar el vue plugin
Vue.use(VueApollo)
```

## Apollo provider

El provider tiene las instancias del cliente Apollo que luego pueden usar todos los componentes secundarios. Inyectelo en sus componentes con `provide`:

```js
new Vue({
  el: '#app',
  apolloProvider,
  render: h => h(App),
})
```
