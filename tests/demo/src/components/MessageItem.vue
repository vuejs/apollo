<template>
  <div class="message-item">
    <div class="user">{{ message.user.nickname }}</div>
    <div class="content" v-html="html"/>
  </div>
</template>

<script>
import marked from 'marked'

// Open links in new tab
const renderer = new marked.Renderer()
const linkRenderer = renderer.link
renderer.link = (href, title, text) => {
  const html = linkRenderer.call(renderer, href, title, text)
  return html.replace(/^<a /, '<a target="_blank" rel="nofollow" ')
}

export default {
  props: {
    message: {
      type: Object,
      required: true,
    },
  },

  computed: {
    html () {
      return marked(this.message.content, { renderer })
    },
  },
}
</script>

<style lang="stylus" scoped>
@import '~@/style/imports'

.message-item
  padding 12px 12px
  &:hover
    background #f8f8f8

.user
  color #777
  font-size 13px
  margin-bottom 2px

.content
  word-wrap break-word

  >>>
    p
      margin 0

    img
      max-width 500px
      max-height 500px
</style>
