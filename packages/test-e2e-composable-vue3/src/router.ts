import { createRouter, createWebHistory } from 'vue-router'
import Welcome from './components/Welcome.vue'
import ChannelView from './components/ChannelView.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Welcome,
    },
    {
      path: '/channel/:id',
      name: 'channel',
      component: ChannelView,
      props: true,
    },
  ],
})
