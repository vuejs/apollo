# 服务端渲染

::: warning
**需要 Vue 2.6+ 对 `serverPrefetch` 的支持**
:::

## Vue CLI 插件

我为 [vue-cli](http://cli.vuejs.org) 制作了一个插件，因此仅用两分钟你就可以将你的 `vue-apollo` 应用转换为同构 SSR 应用！✨🚀

在你的 vue-cli 3 项目中：

```bash
vue add @akryum/ssr
```

[更多信息](https://github.com/Akryum/vue-cli-plugin-ssr)

## 组件的预取

安装 SSR 工具：

```shell
npm install --save @vue/apollo-ssr
```

或：

```shell
yarn add @vue/apollo-ssr
```

::: tip
按照 [官方 SSR 指南](https://ssr.vuejs.org) 了解有关 Vue 服务端渲染的更多信息。
:::

在使用了 `vue-server-renderer` 的默认情况下，服务端渲染的组件中的所有 GraphQL 查询都将被自动预取。

::: tip
即使在服务端，你也能够在诸如 `variables` 等选项中使用 `this`！
:::

示例：

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
    }
  }
}
```

示例 2：

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
      variables() {
        return {
          id: this.id,
        }
      },
    }
  }
}
```

## 跳过预取

你可以通过将一个查询的 `prefetch` 选项设置为 `false` 来跳过对它的服务端预取。

不预取查询的示例：

```js{12}
export default {
  apollo: {
    allPosts: {
      query: gql`query AllPosts {
        allPosts {}
          id
          imageUrl
          description
        }
      }`,
      // 不要预取
      prefetch: false,
    }
  }
}
```

如果要跳过特定组件的所有查询的预取，使用 `$prefetch` 选项：

```js{4}
export default {
  apollo: {
    // 不要预取任何查询
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

## 创建 Apollo 客户端

建议在一个带有 `ssr` 参数的函数内部创建 apollo 客户端，参数在服务端为 `true`，在客户端为 `false`。

如果 `ssr` 为 false，我们将在服务端的 SSR 阶段中将 `window.__APOLLO_STATE__` 变量注入到 HTML 页面中，并通过该变量尝试使用 `cache.restore` 来还原 Apollo 缓存的状态。

这里是一个示例：

```js{21-30}
// apollo.js

import Vue from 'vue'
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client/core'

// 创建 apollo 客户端
export function createApolloClient (ssr = false) {
  const httpLink = new HttpLink({
    // 你需要在这里使用绝对路径
    uri: ENDPOINT + '/graphql',
  })

  const cache = new InMemoryCache()

  // 如果在客户端则恢复注入状态
  if (!ssr) {
    if (typeof window !== 'undefined') {
      const state = window.__APOLLO_STATE__
      if (state) {
        // 如果你有多个客户端，使用 `state.<client_id>`
        cache.restore(state.defaultClient)
      }
    }
  }

  const apolloClient = new ApolloClient({
    link: httpLink,
    cache,
    ...(ssr ? {
      // 在服务端设置此选项以优化 SSR 时的查询
      ssrMode: true,
    } : {
      // 这将暂时禁用查询强制获取
      ssrForceFetchDelay: 100,
    }),
  })

  return apolloClient
}
```

## 创建应用

我们并不立即创建根 Vue 实例，而代以一个接受 `context` 参数的 `createApp` 函数。

此函数将同时在客户端和服务端入口被使用，但在上下文中具有不同的 `ssr` 值。我们在之前编写的 `createApolloClient` 方法中使用此值。

常见的 `createApp` 方法示例：

```js{9,37}
// app.js

import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createStore } from 'vuex'

import VueApollo from '@vue/apollo-option'
import { createApolloClient } from './apollo'

import App from './ui/App.vue'
import routes from './routes'
import storeOptions from './store'

function createMyApp (context) {
  const router = createRouter({
    history: createWebHistory(),
    routes,
  })

  const store = createStore(storeOptions)

  // Vuex 状态恢复
  if (!context.ssr && window.__INITIAL_STATE__) {
    // 我们使用服务端注入的数据来初始化 store 状态
    store.replaceState(window.__INITIAL_STATE__)
  }

  // Apollo
  const apolloClient = createApolloClient(context.ssr)
  const apolloProvider = createApolloProvider({
    defaultClient: apolloClient,
  })

  const app = createApp(App)
  app.use(router)
  app.use(store)
  app.use(apolloProvider)

  return {
    app,
    router,
    store,
    apolloProvider,
  }
}

export default createMyApp
```

## 客户端入口

客户端入口非常简单——我们只需将 `ssr` 设为 `false` 来调用 `createApp`：

```js
// client-entry.js

import createApp from './app'

createApp({
  ssr: false,
}).mount('#app')
```

## 服务端入口

除了存储 Apollo 缓存并将其注入客户端 HTML 之外，不需要任何特殊内容。在官方 SSR 指南中了解有关 [带路由的服务端入口](https://ssr.vuejs.org/guide/routing.html#routing-with-vue-router) 和 [数据预取](https://ssr.vuejs.org/guide/data.html#data-store) 的更多信息。

这里是使用了 vue-router 和 Vuex 的一个示例：

```js{3,26}
// server-entry.js

import ApolloSSR from 'vue-apollo/ssr'
import createApp from './app'

export default () => new Promise((resolve, reject) => {
  const { app, router, store, apolloProvider } = createApp({
    ssr: true,
  })

  // 设置 router 的位置
  router.push(context.url)

  // 等待 router 解析完可能的异步钩子
  router.onReady(() => {
    // 此 `rendered` 钩子将在应用完成渲染时被调用
    context.rendered = () => {
      // 在应用完成渲染后，
      // 我们的 store 现在已经填充入渲染应用程序所需的状态。
      // 当我们将状态附加到上下文，
      // 并且 `template` 选项用于 renderer 时，
      // 状态将自动序列化为 `window.__INITIAL_STATE__`，并注入 HTML。
      context.state = store.state

      // 同样注入 apollo 缓存状态
      context.apolloState = ApolloSSR.getStates(apolloProvider)
    }
    resolve(app)
  })
})
```

使用 [ApolloSSR.getStates](../api/ssr.md#getstates) 方法以获取需要注入到生成的页面、用来将 apollo 缓存数据传递给客户端的 JavaScript 代码。

在 [页面模板](https://ssr.vuejs.org/guide/#using-a-page-template) 中，使用 `renderState` 辅助函数：

```html
{{{ renderState({ contextKey: 'apolloState', windowKey: '__APOLLO_STATE__' }) }}}
```

这里是一个完整的示例：

```html{15}
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <link rel="icon" href="<%= BASE_URL %>favicon.ico">
    <title>{{ title }}</title>
    {{{ renderResourceHints() }}}
    {{{ renderStyles() }}}
  </head>
  <body>
    <!--vue-ssr-outlet-->
    {{{ renderState() }}}
    {{{ renderState({ contextKey: 'apolloState', windowKey: '__APOLLO_STATE__' }) }}}
    {{{ renderScripts() }}}
  </body>
</html>
```
