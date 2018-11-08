# 服务端渲染

## Vue CLI 插件

我为 [vue-cli](http://cli.vuejs.org) 制作了一个插件，因此仅用两分钟你就可以将你的 vue-apollo 应用转换为同构 SSR 应用！✨🚀

在你的 vue-cli 3 项目中：

```bash
vue add @akryum/ssr
```

[更多信息](https://github.com/Akryum/vue-cli-plugin-ssr)

## 预取组件

在要在服务端预取的查询上，添加 `prefetch` 选项。它可以是：
 - 一个变量对象；
 - 一个获取上下文对象（例如可以包含 URL）并返回一个变量对象的函数；
 - `false` 禁用此查询的预取。

如果你在 `prefetch` 选项中返回一个变量对象，请确保它与 `variables` 选项的结果相匹配。如果它们不匹配，则在服务端渲染模板时，查询的数据属性将不会被填充。

::: danger
在服务端进行预取时，你无法访问组件实例。
:::

示例：

```js
export default {
  apollo: {
    allPosts: {
      // 此查询将被预取
      query: gql`query AllPosts {
        allPosts {
          id
          imageUrl
          description
        }
      }`,
      prefetch: true,
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

### 跳过预取

不预取查询的示例：

```js
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

```js
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

你也可以在任何组件上放置一个 `no-prefetch` 属性，以便在遍历树收集 Apollo 查询时忽略它：

```vue
<ApolloQuery no-prefetch>
```

## 在服务端

在服务端入口中，你需要在 Vue 中安装 `ApolloSSR` 插件：

```js
import Vue from 'vue'
import ApolloSSR from 'vue-apollo/ssr'

Vue.use(ApolloSSR)
```

使用 `ApolloSSR.prefetchAll` 方法来预取你已标记的所有 apollo 查询。第一个参数是 `apolloProvider`。第二个参数是要包含的组件定义数组（例如来自 `router.getMatchedComponents` 方法）。第三个参数是传递给 `prefetch` 钩子的上下文对象（参见上文），建议传入 vue-router 的 `currentRoute` 对象。当所有的 apollo 查询都被加载时，它返回已解决的(resolved) promise。

以下是一个使用了 vue-router 和 Vuex store 的示例：

```js
import Vue from 'vue'
import ApolloSSR from 'vue-apollo/ssr'
import App from './App.vue'

Vue.use(ApolloSSR)

export default () => new Promise((resolve, reject) => {
  const { app, router, store, apolloProvider } = CreateApp({
    ssr: true,
  })

  // 设置 router 的位置
  router.push(context.url)

  // 等待 router 解析完可能的异步钩子
  router.onReady(() => {
    const matchedComponents = router.getMatchedComponents()

    // 匹配不到的路由
    if (!matchedComponents.length) {
      reject({ code: 404 })
    }

    let js = ''

    // 调用匹配到路由的组件的预取钩子
    // 每个 preFetch 钩子分配到一个 store action 并返回一个 Promise
    // 当 action 操作完成且 store 状态已更新时解析这个 Promise

    // Vuex Store 预取
    Promise.all(matchedComponents.map(component => {
      return component.asyncData && component.asyncData({
        store,
        route: router.currentRoute,
      })
    }))
    // Apollo 预取
    // 这里将预取整个应用中的所有 Apollo 查询
    .then(() => ApolloSSR.prefetchAll(apolloProvider, [App, ...matchedComponents], {
      store,
      route: router.currentRoute,
    }))
    .then(() => {
      // 将 Vuex 状态和 Apollo 缓存注入到页面
      // 这将防止不必要的查询

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

使用 `ApolloSSR.exportStates(apolloProvider, options)` 方法来获取你需要注入到生成出来页面的 JavaScript 代码，这些代码用于将 apollo 缓存数据传递给客户端。

它需要一个 `options` 参数，默认为：

```js
{
  // 全局变量名
  globalName: '__APOLLO_STATE__',
  // 变量设置到的全局对象
  attachTo: 'window',
  // 每个 apollo 客户端状态的 key 的前缀
  exportNamespace: '',
}
```

你也可以使用 `ApolloSSR.getStates(apolloProvider, options)` 方法来获取 JS 对象而不是脚本字符串。

它需要一个 `options` 参数，默认为：

```js
{
  // 每个 apollo 客户端状态的 key 的前缀
  exportNamespace: '',
}
```

### 创建 Apollo Client

建议在一个带有 `ssr` 参数的函数内部创建 apollo 客户端，参数在服务端为 `true`，在客户端为 `false`。

这里是一个示例：

```js
// src/api/apollo.js

import Vue from 'vue'
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import VueApollo from 'vue-apollo'

// 安装 vue 插件
Vue.use(VueApollo)

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

常见的 `CreateApp` 方法示例：

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

  // 同步路由到 vuex store
  // 将注册 `store.state.route`
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

在客户端：

```js
import CreateApp from './app'

CreateApp({
  ssr: false,
})
```

在服务端：

```js
import CreateApp from './app'

export default () => new Promise((resolve, reject) => {
  const { app, router, store, apolloProvider } = CreateApp({
    ssr: true,
  })

  // 设置 router 的位置
  router.push(context.url)

  // 等待 router 解析完可能的异步钩子
  router.onReady(() => {
    // 预取，渲染 HTML（参见上文）
  })
})
```