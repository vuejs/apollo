<template>
  <div class="channel-list">
    <UserCurrent />

    <ApolloQuery :query="require('../graphql/channels.gql')">
      <template slot-scope="{ result: { data, loading } }">
        <div v-if="loading" class="loading">Loading...</div>
        <div v-else-if="data" class="channels">
          <router-link
            v-for="channel of data.channels"
            :key="channel.id"
            :to="{ name: 'channel', params: { id: channel.id } }"
            class="channel"
          >
            <div class="id">#{{ channel.id }}</div>
            <div class="name">{{ channel.name }}</div>
          </router-link>
        </div>
      </template>
    </ApolloQuery>
  </div>
</template>

<script>
import UserCurrent from './UserCurrent.vue'

export default {
  name: 'ChannelList',

  components: {
    UserCurrent,
  },
}
</script>

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
