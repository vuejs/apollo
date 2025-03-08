import { createRouter, createWebHistory } from 'vue-router'
import ChannelView from './components/ChannelView.vue'
import ManualAddSmartQuery from './components/ManualAddSmartQuery.vue'
import PartialError from './components/PartialError.vue'
import UserLogin from './components/UserLogin.vue'
import WelcomeView from './components/WelcomeView.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: WelcomeView,
      meta: {
        private: true,
      },
    },
    {
      path: '/login',
      name: 'login',
      component: UserLogin,
    },
    {
      path: '/chan/:id',
      name: 'channel',
      component: ChannelView,
      props: true,
      meta: {
        private: true,
      },
    },
    {
      path: '/partial-error',
      component: PartialError,
    },
    {
      path: '/manual-add-smart-query',
      component: ManualAddSmartQuery,
    },
    {
      path: '/update-cache',
      component: () => import('./components/UpdateCache.vue'),
    },
  ],
})
