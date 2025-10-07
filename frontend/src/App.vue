<template>
  <nav class="navbar">
    <!-- Glavni linkovi koji su svima vidljivi -->
    <a href="/" @click.prevent="$router.push('/')">Početna</a>
    <a href="/reservations" @click.prevent="$router.push('/reservations')">Rezervacije</a>

    <!-- Dodatni linkovi za prijavljene korisnike -->
    <template v-if="isAuth">
      <a href="/games" @click.prevent="$router.push('/games')">Igre</a>
      <a href="/events" @click.prevent="$router.push('/events')">Eventi</a>
      <a href="/quizzes" @click.prevent="$router.push('/quizzes')">Kvizovi</a>
    </template>

    <!-- Desna strana navbar-a -->
    <span style="margin-left:auto"></span>

    <!-- Ako nije prijavljen -->
    <template v-if="!isAuth">
      <a href="/login" @click.prevent="$router.push('/login')">Prijava</a>
      <a href="/register" @click.prevent="$router.push('/register')">Registracija</a>
    </template>

    <!-- Ako je prijavljen -->
    <template v-else>
      <span class="user-label">
        Prijavljen: {{ user?.username || user?.email }}
      </span>
      <a
        v-if="isAdminOrBetter"
        href="/admin/events"
        @click.prevent="$router.push('/admin/events')"
      >Admin</a>
      <a href="#" @click.prevent="logout">Odjava</a>
    </template>
  </nav>

  <RouterView />
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const user = ref(null)
const isAuth = ref(false)

onMounted(() => {
  const stored = localStorage.getItem('user')
  if (stored) {
    user.value = JSON.parse(stored)
    isAuth.value = true
  }
})

const isAdminOrBetter = computed(() =>
  user.value &&
  (user.value.user_type === 'ADMIN' || user.value.user_type === 'SUPERADMIN')
)

function logout() {
  localStorage.removeItem('user')
  localStorage.removeItem('token')
  user.value = null
  isAuth.value = false
  window.location.href = '/'
}
</script>

<style>
.navbar {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #222;
  color: white;
  align-items: center;
}

.navbar a {
  color: white;
  text-decoration: none;
  transition: color 0.2s;
}

.navbar a:hover {
  color: #66b3ff;
}

.user-label {
  opacity: 0.8;
}
</style>
