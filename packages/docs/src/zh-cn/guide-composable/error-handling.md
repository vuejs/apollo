# 错误处理

从简单到复杂的任何应用程序都可能有相当多的错误。重要的是要处理这些错误，并在可能的情况下，将这些错误报告给用户以供参考。使用 GraphQL 会从实际的 GraphQL 响应本身带来一系列新的可能的错误。考虑到这一点，这里有几种不同类型的错误：

- GraphQL 错误：GraphQL 结果中的错误，可能与成功的数据一起出现
- 服务器错误：服务器内部错误，导致无法形成成功的响应
- 事务错误：事务操作中的错误，例如对变更的 `update`
- UI 错误：组件代码中出现的错误
- Apollo Client 错误：核心或相应库中的内部错误

## 错误策略

与 `fetchPolicy` 相似，`errorPolicy` 允许你控制如何将来自服务器的 GraphQL 错误发送到你的 UI 代码。默认情况下，错误策略将任何 GraphQL 错误视为网络错误并结束请求链。它不会在缓存中保存任何数据，并以 `error` 属性的值是一个 ApolloError 来渲染你的 UI。通过改变每个请求的策略，你可以调整 GraphQL 错误在缓存和 UI 中的管理方式。`errorPolicy` 的可能选项有：

- `none`：这是默认的策略，以配合 Apollo Client 1.0 工作。任何 GraphQL 错误都被视为与网络错误相同，并且任何数据都将从响应中忽略。
- `ignore`：允许你读取与 GraphQL 错误一同返回的任何数据，但不会保存错误或将错误报告给你的 UI。
- `all`：使用 `all` 策略是向你的用户通知潜在问题的最佳方式，同时还可以尽可能多的展示从服务端返回的数据。它将数据和错误都保存到 Apollo 缓存中，这样你的 UI 就可以使用它们。

你可以像这样为每个请求设置 `errorPolicy`：

```vue{10}
<script>
export default {
  setup () {
    const { result, loading, error } = useQuery(gql`
      query WillFail {
        badField
        goodField
      }
    `, null, {
      errorPolicy: 'all',
    })

    return {
      result,
      loading,
      error,
    }
  },
}
</script>

<template>
  <div v-if="loading">Loading...</div>
  <div v-else>
    <h2>Good: {{ result.goodField }}</h2>
    <pre>Bad:
      <span v-for="(error, i) of error.graphQLErrors" :key="i">
        {{ error.message }}
      </span>
    </pre>
  </div>
</template>
```

## 网络错误

使用 Apollo Link 时，处理网络错误的能力更加强大。最好的方法是使用 `@apollo/client/link/error` 来捕获和处理服务器错误、网络错误和 GraphQL 错误。如果你想与其他连接结合使用，请参阅 [组合连接](https://www.apollographql.com/docs/link/composition)。

```js
import { onError } from '@apollo/client/link/error'

const link = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.map(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
      ),
    )
  }

  if (networkError)
    console.log(`[Network error]: ${networkError}`)
})
```

你可以使用 `@vue/apollo-util` 包中的 `logErrorMessages` 函数在浏览器控制台中对错误进行格式化：

```js
import { onError } from '@apollo/client/link/error'
import { logErrorMessages } from '@vue/apollo-util'

const link = onError((error) => {
  logErrorMessages(error)
})
```

错误示例：

![错误日志截图](/error-log.jpeg)

如果你使用的是 Webpack 或 Vue CLI，则最好仅在开发环境中使用它：

```js
import { onError } from '@apollo/client/link/error'
import { logErrorMessages } from '@vue/apollo-util'

const link = onError((error) => {
  if (process.env.NODE_ENV !== 'production') {
    logErrorMessages(error)
  }
})
```

这样就会在编译项目到生产环境时将其删除。

#### 选项

错误连接在发生错误时调用的函数。使用包含以下键的对象调用此函数：

- `operation`：错误的操作
- `response`：来自服务器的响应
- `graphQLErrors`：来自 GraphQL 入口端点的错误数组
- `networkError`：连接执行或服务器响应期间的任何错误

#### 忽略错误

如果你想要有条件地忽略错误，可以在错误处理函数中设置 `response.errors = null;`：

```js
onError(({ response, operation }) => {
  if (operation.operationName === 'IgnoreErrorsQuery') {
    response.errors = null
  }
})
```
