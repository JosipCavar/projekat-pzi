<template>
  <div class="create-admin-page">
    <h1>👑 Kreiraj novog administratora</h1>
    <p class="subtitle">Ovu opciju može koristiti samo SuperAdmin.</p>

    <div v-if="msg" :class="msgType" class="feedback">{{ msg }}</div>

    <form @submit.prevent="createAdmin" class="admin-form">
      <div class="form-field">
        <label for="email">📧 E-mail</label>
        <input
          id="email"
          type="email"
          v-model="email"
          required
          placeholder="unesi e-mail"
        />
      </div>

      <div class="form-field">
        <label for="username">👤 Korisničko ime</label>
        <input
          id="username"
          type="text"
          v-model="username"
          required
          placeholder="unesi korisničko ime"
        />
      </div>

      <div class="form-field">
        <label for="password">🔑 Lozinka</label>
        <input
          id="password"
          type="password"
          v-model="password"
          required
          placeholder="unesi lozinku"
        />
      </div>

      <button type="submit" class="primary-btn" :disabled="loading">
        {{ loading ? '⏳ Spremam...' : '➕ Kreiraj administratora' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const email = ref('')
const username = ref('')
const password = ref('')
const msg = ref('')
const msgType = ref('')
const loading = ref(false)
const router = useRouter()

onMounted(() => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  if (user.user_type !== 'SUPERADMIN') {
    msg.value = '❌ Samo SuperAdmin ima pristup ovoj stranici.'
    msgType.value = 'error'
    setTimeout(() => router.push('/'), 1500)
  }
})

async function createAdmin() {
  msg.value = ''
  loading.value = true
  const token = localStorage.getItem('token') || ''

  try {
    const res = await fetch(`${import.meta.env.VITE_API}/api/admin/create-admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token
      },
      body: JSON.stringify({
        email: email.value,
        username: username.value,
        password: password.value
      })
    })

    const json = await res.json()
    if (!res.ok) throw new Error(json.error || 'Greška prilikom kreiranja.')

    msg.value = '✅ Administrator uspješno kreiran!'
    msgType.value = 'success'
    email.value = ''
    username.value = ''
    password.value = ''
  } catch (err) {
    msg.value = '❌ ' + err.message
    msgType.value = 'error'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.create-admin-page {
  max-width: 500px;
  margin: 3rem auto;
  background: #ffffff;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

h1 {
  text-align: center;
  margin-bottom: 0.5rem;
  color: #1a237e;
}

.subtitle {
  text-align: center;
  color: #555;
  margin-bottom: 1.5rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}
label {
  font-weight: 600;
  margin-bottom: 5px;
  color: #222;
}
input {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}
input:focus {
  border-color: #007bff;
  outline: none;
}

.primary-btn {
  width: 100%;
  background: #007bff;
  color: white;
  border: none;
  padding: 12px;
  font-size: 1rem;
  border-radius: 10px;
  cursor: pointer;
  transition: 0.2s;
}
.primary-btn:hover {
  background: #0056b3;
}

.feedback {
  padding: 12px;
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
  margin-bottom: 1rem;
}
.success {
  background: #d4edda;
  color: #155724;
}
.error {
  background: #f8d7da;
  color: #721c24;
}
</style>
