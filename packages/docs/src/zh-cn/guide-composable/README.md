# 简介

组合 API 是一种让你可以在 `setup` 选项中的以容易组合的方式编写数据和逻辑的 API。

如果你正在使用 Typescript，强烈建议开始使用组合 API，因为它的类型能力是任何其他 Vue API 都无法比拟的。

[在这里](https://vue-composition-api-rfc.netlify.com/) 了解更多关于组合 API 的信息。

这里是一个使用该 API 的示例：

```vue
<script>
export default {
  props: ['userId'],

  setup (props) {
    // 在此处添加数据和逻辑……

    // 将内容暴露给模板
    return {
      props.userId,
    }
  },
}
</script>
```
