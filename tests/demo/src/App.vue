<template>
  <div id="app">
    <ChannelList/>
    <div class="content">
      <router-view/>
    </div>
  </div>
</template>

<script>
import ChannelList from './components/ChannelList.vue'

import CHANNELS from './graphql/channels.gql'

export default {
  components: {
    ChannelList,
  },

  apollo: {
    channels: CHANNELS,
  },
}
</script>

<style lang="stylus">
@import '~@/style/imports'

html,
body,
#app
  height 100%

body
  margin 0
  font-family 'Lato', 'Avenir', Helvetica, Arial, sans-serif
  -webkit-font-smoothing antialiased
  -moz-osx-font-smoothing grayscale

#app
  color #2c3e50
  display grid
  grid-template-columns 300px 1fr
  grid-template-rows 1fr

:focus
  outline none

a
  text-decoration none
  color $color
  cursor pointer
  &:hover
    color lighten($color, 30%)

.form-input
  border none
  border solid 1px #eee
  border-radius 3px
  padding 8px
  font-family inherit
  font-size inherit
  color inherit
  &:focus
    border-color $color

.button,
.icon-button
  display inline-flex
  align-items center
  justify-content center
  background lighten($color, 90%)
  border none
  border-radius 3px
  padding 8px
  cursor pointer
  font-size inherit
  color $color
  box-sizing border-box
  &:hover
    background $color
    color white

.icon-button
  width 32px
  height @width
  .material-icons
    font-size 16px

.error
  color red
  padding 8px
  background lighten(red, 95%)
  border-radius 3px
  margin-bottom 8px
</style>
