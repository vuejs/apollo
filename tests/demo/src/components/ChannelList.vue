<template>
  <div class="hello">
    <ApolloQuery :query="require('../graphql/channels.gql')">
      <template slot-scope="{ result: { data, loading } }">
        <div v-if="loading">Loading...</div>
        <div v-else-if="data" class="channels">
          <router-link
            v-for="channel of data.channels"
            :key="channel.id"
            :to="{ name: 'channel', params: { id: channel.id } }"
            class="channel"
          >
            <div class="name">{{ channel.name }}</div>
            <div class="id">{{ channel.id }}</div>
          </router-link>
        </div>
      </template>
    </ApolloQuery>
  </div>
</template>

<style lang="stylus" scoped>
.channel
  display block

.id
  font-family monospace
  font-size 10px
</style>
