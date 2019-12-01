import Vue from 'vue'
import Router from 'vue-router'
import UserLogin from './components/UserLogin.vue'
import WelcomeView from './components/WelcomeView.vue'
import ChannelView from './components/ChannelView.vue'
import PartialError from './components/PartialError.vue'
import Subscriptions from './components/Subscriptions.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
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
      path: '/subscriptions',
      component: Subscriptions,
    },
  ],
})
