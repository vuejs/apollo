import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

export function createRouter () {
  const routes = [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/apollo',
      name: 'apollo',
      component: () => import(/* webpackChunkName: "apollo" */ '../components/ApolloExample.vue')
    },
    {
      path: '/apollo-loading',
      name: 'apollo-loading',
      component: () => import(/* webpackChunkName: "apollo-loading" */ '../components/ApolloLoading.vue')
    },
    {
      path: '/inline-template',
      name: 'inline-template',
      component: () => import(/* webpackChunkName: "inline-template" */ '../components/InlineTemplate.vue')
    },
    {
      path: '/hello',
      name: 'hello',
      component: () => import(/* webpackChunkName: "hello" */ '../components/HelloWorld.vue')
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
    }
  ]

  const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
  })

  return router
}
