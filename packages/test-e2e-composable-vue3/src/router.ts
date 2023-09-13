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
      path: '/lazy-query-immediately',
      component: () => import('./components/LazyQueryImmediately.vue'),
    },
    {
      path: '/lazy-query-load',
      component: () => import('./components/LazyQueryLoad.vue'),
    },
    {
      path: '/lazy-query-load-error',
      component: () => import('./components/LazyQueryLoadError.vue'),
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
    {
      path: '/keep-previous-result',
      component: () => import('./components/KeepPreviousResult.vue'),
    },
    {
      path: '/null-query',
      component: () => import('./components/NullQuery.vue'),
    },
    {
      path: '/pinia',
      component: () => import('./components/ChannelListPinia.vue'),
      meta: {
        layout: 'blank',
      },
    },
    {
      path: '/pinia2',
      component: () => import('./components/ChannelListPinia2.vue'),
      meta: {
        layout: 'blank',
      },
    },
  ],
})
