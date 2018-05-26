<template>
  <div class="channel-view">
    <ApolloQuery
      :query="require('../graphql/channel.gql')"
      :variables="{
        id
      }"
    >
      <template slot-scope="{ result: { data, loading } }">
        <div v-if="loading" class="loading">Loading...</div>

        <div v-else-if="data">
          <div class="wrapper">
            <div class="header">
              <div class="id">#{{ data.channel.id }}</div>
              <div class="name">{{ data.channel.name }}</div>
            </div>
            <div class="body">

            </div>
            <div class="footer">
              <MessageForm :channel-id="id" />
            </div>
          </div>
        </div>
      </template>
    </ApolloQuery>
  </div>
</template>

<script>
import MessageForm from './MessageForm.vue'

export default {
  name: 'ChannelView',

  components: {
    MessageForm,
  },

  props: {
    id: {
      type: String,
      required: true,
    },
  },
}
</script>

<style lang="stylus" scoped>
@import '~@/style/imports'

.wrapper
  height 100vh
  display grid
  grid-template-columns 1fr
  grid-template-rows auto 1fr auto

.header
  padding 8px
  border-bottom $border

.id
  font-family monospace
  margin-bottom 4px

.name
  color #555

.footer
  border-top $border
</style>
