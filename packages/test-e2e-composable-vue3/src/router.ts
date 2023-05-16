import { createRouter, createWebHistory } from 'vue-router'

export const router = createRouter({
  history: createWebHistory(),
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
      path: '/no-setup-query',
      component: () => import('./components/NoSetupQuery.vue'),
    },
    {
      path: '/no-setup-query-multi-client',
      component: () => import('./components/NoSetupQueryMultiClient.vue'),
    },
    {
      path: '/lazy-query',
      component: () => import('./components/LazyQuery.vue'),
    },
    {
      path: '/lazy-query-immediatly',
      component: () => import('./components/LazyQueryImmediatly.vue'),
    },
    {
      path: '/partial-error',
      component: () => import('./components/PartialError.vue'),
    },
    {
      path: '/disabled',
      component: () => import('./components/Disabled.vue'),
    },
    {
      path: '/on-result',
      component: () => import('./components/OnResult.vue'),
    },
  ],
})
