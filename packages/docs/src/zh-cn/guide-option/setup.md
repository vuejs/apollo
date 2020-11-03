# Setup

确保你已经 [安装了 Apollo Client](../guide/installation.md)。

## 1. 安装 @vue/apollo-option

```
npm install --save @vue/apollo-option
```

或：

```
yarn add @vue/apollo-option
```

## 2. 安装插件到 Vue

```js
import Vue from 'vue'
import VueApollo from '@vue/apollo-option'

Vue.use(VueApollo)
```

## 3. 注入 Apollo provider

Provider 保存了可以在接下来被所有子组件使用的 Apollo 客户端实例。

```js
const apolloProvider = new VueApollo({
  defaultClient: apolloClient,
})
```

使用 `apolloProvider` 选项将它添加到你的应用程序：

```js
new Vue({
  el: '#app',
  // 像 vue-router 或 vuex 一样注入 apolloProvider
  apolloProvider,
  render: h => h(App),
})
```

现在你已经完成了在组件中使用 Apollo 的所有准备了！
