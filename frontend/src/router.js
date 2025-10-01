
import { createRouter, createWebHistory } from 'vue-router'

import Home from './pages/Home.vue'
import Teams from './pages/Teams.vue'
import Games from './pages/Games.vue'
import Reservations from './pages/Reservations.vue'
import Login from './pages/Login.vue'
import Register from './pages/Register.vue'
import AdminEvents from './pages/AdminEvents.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/teams', component: Teams },
  { path: '/games', component: Games },
  { path: '/reservations', component: Reservations },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/admin/events', component: AdminEvents }
]

export default createRouter({ history: createWebHistory(), routes })
