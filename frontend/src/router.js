import { createRouter, createWebHistory } from 'vue-router'

// 📦 Import svih stranica
import Home from './pages/Home.vue'
import Teams from './pages/Teams.vue'
import Games from './pages/Games.vue'
import Events from './pages/Events.vue'
import Reservations from './pages/Reservations.vue'
import Login from './pages/Login.vue'
import Register from './pages/Register.vue'
import AdminEvents from './pages/AdminEvents.vue'
import Quizzes from './pages/Quizzes.vue'
import CreateAdmin from './pages/CreateAdmin.vue'
import Friends from './pages/Friends.vue' // ✅ NOVO – Stranica za prijatelje

// 🧭 Definicija svih ruta
const routes = [
  // 🏠 Glavne javne stranice
  { path: '/', component: Home },
  { path: '/games', component: Games },
  { path: '/events', component: Events },
  { path: '/quizzes', component: Quizzes },

  // 🧾 Rezervacije i timovi
  { path: '/reservations', component: Reservations },
  { path: '/teams', component: Teams },

  // 👥 Prijatelji
  { path: '/friends', component: Friends },

  // 🔐 Autentifikacija
  { path: '/login', component: Login },
  { path: '/register', component: Register },

  // 🧰 Administracija
  { path: '/admin/events', component: AdminEvents },
  { path: '/create-admin', component: CreateAdmin },

  // 🧪 Test ruta
  {
    path: '/test',
    component: {
      template: `
        <div style="text-align:center; margin-top:50px;">
          <h1>✅ Router radi ispravno!</h1>
          <p>Ova testna ruta je učitana.</p>
          <router-link to="/quizzes">Idi na Quizzes</router-link>
        </div>
      `
    }
  },

  // ⚠️ 404 – Stranica nije pronađena
  {
    path: '/:pathMatch(.*)*',
    component: {
      template: `
        <div style="text-align:center; margin-top:50px;">
          <h1>❌ 404 - Stranica nije pronađena</h1>
          <router-link to="/">↩️ Povratak na početnu</router-link>
        </div>
      `
    }
  }
]

// 🚀 Kreiraj i izvezi router
export default createRouter({
  history: createWebHistory(),
  routes
})
