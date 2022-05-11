import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import Home from '../views/Home.vue'
import Profile from '../views/Profile.vue'
import Settings from '../views/Settings.vue'
import ProfileSettings from '../views/Tabs/Settings/ProfileSettings.vue'
import Jobs from '../views/Tabs/Profile/Jobs.vue'
import Orders from '../views/Tabs/Profile/Orders.vue'
import Dashboard from '../views/Dashboard.vue'
import AdminPanel from "../views/AdminPanel.vue"
import store from '../store'

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },

  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard
  },

  { 
    path: '/admin',
    name: 'AdminPanel',
    component: AdminPanel
  },

  {
    path: '/account',
    name: 'Profile',
    component: Profile,
    children: [
      {
        path: '/account/jobs',
        name: 'Jobs',
        component: Jobs
      }, 

      {
        path: '/account/orders',
        name: 'Orders',
        component: Orders
      }
    ]
  },

  {
    path: '/user/:id',
    name: 'OtherProfile',
    component: Profile,
  },

  {
    path: '/account/settings',
    name: 'Settings',
    component: Settings,
    children: [

      {
        path: '/account/settings/profile',
        name: 'ProfileSettings',
        component: ProfileSettings
      },

    ]
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
