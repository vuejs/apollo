import { createMemoryHistory, createRouter, createWebHistory } from 'vue-router'
import { isServer } from './env.js'

export function createMyRouter() {
  const router = createRouter({
    history: isServer ? createMemoryHistory() : createWebHistory(),
    routes: [
      {
        path: '/',
        name: 'home',
        component: () => import('./components/Welcome.vue'),
      },
      {
        path: '/channel/:id',
        name: 'channel',
        component: () => import('./components/ChannelView.vue'),
        props: true,
      },
      {
        path: '/lazy-query',
        component: () => import('./components/LazyQuery.vue'),
      },
      {
        path: '/lazy-query-immediately',
        component: () => import('./components/LazyQueryImmediately.vue'),
      },
    ],
  })

  return {
    router,
  }
}
