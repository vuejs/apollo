<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/apollo">Apollo</router-link> |
      <router-link to="/about">About</router-link>
    </div>
    <router-view/>

    <div v-if="apolloState" class="apollo-state">{{ apolloState }}</div>
  </div>
</template>

<script>
import { ref, onMounted } from '@vue/composition-api'

export default {
  setup () {
    const apolloState = ref()

    onMounted(() => {
      apolloState.value = JSON.stringify(window.__APOLLO_STATE__)
    })

    return {
      apolloState
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}

.apollo-state {
  color: #666;
  background: #f8f8f8;
  font-family: monospace;
  padding: 24px;
  border-radius: 6px;
  margin-top: 64px;
}
</style>
