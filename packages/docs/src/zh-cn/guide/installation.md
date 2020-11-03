# 安装

## Vue CLI 插件

我为 [vue-cli](http://cli.vuejs.org) 制作了一个插件，因此仅用两分钟你就可以添加 Apollo（附带一个可选的 GraphQL 服务器）！✨🚀

在你的 vue-cli 3 项目中：

```bash
vue add apollo
```

然后你可以跳到下一部分：[基本用法](../guide-option/usage.md)。

[更多信息](https://github.com/Akryum/vue-cli-plugin-apollo)

## 手动安装

```
npm install --save graphql graphql-tag @apollo/client
```

或：

```
yarn add graphql graphql-tag @apollo/client
```

在你的应用中创建一个 `ApolloClient` 实例：

```js
import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client/core'

// 与 API 的 HTTP 连接
const httpLink = createHttpLink({
  // 你需要在这里使用绝对路径
  uri: 'http://localhost:3020/graphql',
})

// 缓存实现
const cache = new InMemoryCache()

// 创建 apollo 客户端
const apolloClient = new ApolloClient({
  link: httpLink,
  cache,
})
```

## IDE 集成

### Visual Studio Code

如果你使用 VS Code，推荐你安装 [Apollo GraphQL 扩展](https://marketplace.visualstudio.com/items?itemName=apollographql.vscode-apollo)。

然后在 Vue 项目的根目录中创建 `apollo.config.js` 文件来配置它：

```js
// apollo.config.js
module.exports = {
  client: {
    service: {
      name: 'my-app',
      // GraphQL API 的 URL
      url: 'http://localhost:3000/graphql',
    },
    // 通过扩展名选择需要处理的文件
    includes: [
      'src/**/*.vue',
      'src/**/*.js',
    ],
  },
}
```

### Webstorm

如果你使用 Webstorm，推荐你安装 [JS GraphQL 扩展](https://plugins.jetbrains.com/plugin/8097-js-graphql/)。

然后在 Vue 项目的根目录中创建 `.graphqlconfig` 文件来配置它：

```graphqlconfig
{
  "name": "Untitled GraphQL Schema",
  "schemaPath": "./path/to/schema.graphql",
  "extensions": {
    "endpoints": {
      "Default GraphQL Endpoint": {
        "url": "http://url/to/the/graphql/api",
        "headers": {
          "user-agent": "JS GraphQL"
        },
        "introspect": false
      }
    }
  }
}
```

## 下一步

继续阅读以下指南：

- [选项（经典）API](../guide-option/setup.md)
- [组合（进阶）API](../guide-composable/setup.md)
- [组件 API](../guide-components/setup.md)
- [进阶主题](../guide-advanced)
