<script>
export default {
  name: 'WelcomeView',
}
</script>

<template>
  <div class="welcome-view">
    <div class="title">Welcome!</div>
    <div class="info">Select a channel to start messaging</div>
  </div>
</template>

<style lang="stylus" scoped>
@import '~@/style/imports'

.welcome-view
  height 100%
  display flex
  flex-direction column
  align-items center
  justify-content center

.title
  font-size 42px
  font-weight lighter
  margin-bottom 12px

.info
  color #555
</style>
