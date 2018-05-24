<template>
  <div id="app">
    <ChannelList/>
    <div class="content">
      <router-view/>
    </div>
  </div>
</template>

<script>
import ChannelList from '@/components/ChannelList.vue'

export default {
  components: {
    ChannelList,
  },
}
</script>

<style lang="stylus">
#app
  font-family 'Avenir', Helvetica, Arial, sans-serif
  -webkit-font-smoothing antialiased
  -moz-osx-font-smoothing grayscale
  text-align center
  color #2c3e50

#nav
  padding 30px
  a
    font-weight bold
    color #2c3e50
    &.router-link-exact-active
      color #42b983
</style>
