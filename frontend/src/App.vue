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
        👤 {{ user?.username || user?.email }}
      </span>

      <!-- Admin pristup -->
      <a
        v-if="isAdminOrBetter"
        href="/admin/events"
        @click.prevent="$router.push('/admin/events')"
      >
        Admin
      </a>

      <!-- SuperAdmin može dodavati admine -->
      <a
        v-if="isSuperAdmin"
        href="/create-admin"
        @click.prevent="$router.push('/create-admin')"
        class="superadmin-link"
      >
        ➕ Dodaj Admina
      </a>

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

// 👑 SuperAdmin provjera
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
  opacity: 0.9;
  margin-right: 0.5rem;
}

/* 🔹 Poseban izgled za SuperAdmin link */
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
</style>
