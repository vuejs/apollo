<script>
import gql from 'graphql-tag'

const query = gql`query items {
  items {
    id
    name
  }
}`

export default {
  name: 'UpdateCache',

  data () {
    return {
      items: [],
      changes: 0,
    }
  },

  apollo: {
    items: {
      query,
    },
  },

  watch: {
    items: {
      handler (items) {
        console.log('items:', JSON.stringify(items, null, 2))
        this.changes++
      },
      deep: true,
    },
  },

  methods: {
    addItem () {
      let data = this.$apollo.getClient().readQuery({ query })
      data = {
        ...data,
        items: [
          ...data.items,
          {
            id: data.items.length + 1,
            name: `Item ${data.items.length + 1}`,
          },
        ],
      }
      this.$apollo.getClient().writeQuery({ query, data })
    },
  },
}
</script>

<template>
  <div class="item-list">
    <ul>
      <li
        v-for="item of items"
        :key="item.id"
      >
        {{ item.name }}
      </li>
    </ul>
    <div class="update-count">
      Changes: {{ changes }}
    </div>
    <button
      class="add"
      @click="addItem()"
    >
      Add item
    </button>
  </div>
</template>
