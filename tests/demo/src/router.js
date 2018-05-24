import Vue from 'vue'
import Router from 'vue-router'
import WelcomeView from './components/WelcomeView.vue'
import ChannelView from './components/ChannelView.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'home',
      component: WelcomeView,
    },
    {
      path: '/:id',
      name: 'channel',
      component: ChannelView,
      props: true,
    },
  ],
})
