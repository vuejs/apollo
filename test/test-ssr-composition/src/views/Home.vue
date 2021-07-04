<template>
  <div class="home">
    <img
      alt="Vue logo"
      src="../assets/logo.png"
    >

    <div>{{ meow }}</div>
    <div>{{ kui.hi }}</div>
    <div>{{ meuh.hi }}</div>
    <div>{{ isServer }}</div>
  </div>
</template>

<script>
import { ref, reactive } from '@vue/composition-api'
import Vue from 'vue'
export default {
  name: 'Home',

  setup (props, { isServer }) {
    const meow = ref('waf')
    meow.value = 'meow'
    const kui = reactive({
      hi: 'waf',
    })
    kui.hi = 'kui'
    const meuh = Vue.observable({
      hi: 'waf',
    })
    meuh.hi = 'meuh'
    console.log(kui)
    return {
      meow,
      kui,
      meuh,
      isServer,
    }
  },
}
</script>
