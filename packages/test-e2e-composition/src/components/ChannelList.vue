<script>
import UserCurrent from './UserCurrent.vue'
import MockSendMessage from './MockSendMessage.vue'
import gql from 'graphql-tag'
import { useQuery, useResult } from '@vue/apollo-composable'

const CHANNELS = gql`
query channels {
  channels {
    id
    name
  }
}
`

export default {
  name: 'ChannelList',

  components: {
    UserCurrent,
    MockSendMessage,
  },

  setup () {
    const { result, loading } = useQuery(CHANNELS)
    const channels = useResult(result, [])

    return {
      channels,
      loading,
    }
  },
}
</script>

<template>
  <div class="channel-list">
    <UserCurrent />

    <div
      v-if="loading"
      class="loading"
    >
      Loading...
    </div>
    <div class="channels">
      <router-link
        v-for="channel of channels"
        :key="channel.id"
        :to="{ name: 'channel', params: { id: channel.id } }"
        class="channel"
      >
        <div class="id">
          #{{ channel.id }}
        </div>
        <div class="name">
          {{ channel.name }}
        </div>
      </router-link>
    </div>

    <MockSendMessage />
  </div>
</template>

<style lang="stylus" scoped>
@import '~@/style/imports'

.channel-list
  background desaturate(darken($color, 60%), 95%)
  color white
  padding 12px

.channel
  display block
  padding 12px
  border-radius 4px
  &:hover
    background rgba($color, .3)
  &.router-link-active
    background $color
    color white
    font-weight bold

.id
  font-family monospace
  margin-bottom 4px
  font-size 14px

.name
  font-size 12px
  opacity .9
</style>
