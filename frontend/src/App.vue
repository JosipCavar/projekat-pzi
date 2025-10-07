<template>
  <nav class="navbar">
    <!-- Glavni linkovi vidljivi svima -->
    <a href="/" @click.prevent="$router.push('/')">Početna</a>
    <a href="/reservations" @click.prevent="$router.push('/reservations')">Rezervacije</a>

    <!-- Linkovi za prijavljene korisnike -->
    <template v-if="isAuth">
      <a href="/games" @click.prevent="$router.push('/games')">Igre</a>
      <a href="/events" @click.prevent="$router.push('/events')">Eventi</a>
      <a href="/quizzes" @click.prevent="$router.push('/quizzes')">Kvizovi</a>
      <a href="/friends" @click.prevent="$router.push('/friends')">Prijatelji</a>
      <a href="/teams" @click.prevent="$router.push('/teams')">Timovi</a>
    </template>

    <!-- Razmak prije desne strane -->
    <span style="margin-left:auto"></span>

    <!-- Ako nije prijavljen -->
    <template v-if="!isAuth">
      <a href="/login" @click.prevent="$router.push('/login')">Prijava</a>
      <a href="/register" @click.prevent="$router.push('/register')">Registracija</a>
    </template>

    <!-- Ako je prijavljen -->
    <template v-else>
      <span class="user-label">
        👤 {{ user?.username || user?.email }}
      </span>

      <!-- Admin -->
      <a
        v-if="isAdminOrBetter"
        href="/admin/events"
        @click.prevent="$router.push('/admin/events')"
        class="admin-link"
      >
        Admin
      </a>

      <!-- SuperAdmin -->
      <a
        v-if="isSuperAdmin"
        href="/create-admin"
        @click.prevent="$router.push('/create-admin')"
        class="superadmin-link"
      >
        ➕ Dodaj Admina
      </a>

      <a href="#" @click.prevent="logout" class="logout">Odjava</a>
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

const isSuperAdmin = computed(() => user.value?.user_type === 'SUPERADMIN')

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
  padding: 1rem 2rem;
  background: #111;
  color: white;
  align-items: center;
  font-size: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.navbar a {
  color: #f0f0f0;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.navbar a:hover {
  color: #66b3ff;
}

.user-label {
  opacity: 0.9;
  margin-right: 0.5rem;
  font-weight: 600;
}

.admin-link {
  background: #444;
  padding: 6px 10px;
  border-radius: 8px;
  font-weight: 600;
}
.admin-link:hover {
  background: #666;
}

.superadmin-link {
  background: #007bff;
  padding: 6px 10px;
  border-radius: 8px;
  color: white !important;
  font-weight: 600;
  transition: background 0.25s;
}
.superadmin-link:hover {
  background: #0056b3;
}

.logout {
  background: transparent;
  border: none;
  padding: 6px 10px;
  border-radius: 6px;
  color: #ff8080;
  font-weight: 600;
  cursor: pointer;
}
.logout:hover {
  color: #ff4d4d;
}
</style>
