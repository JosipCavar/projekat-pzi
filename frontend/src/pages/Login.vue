<template>
  <div class="page-container">
    <div class="login-card fade-in">
      <h1>🔐 Prijava</h1>
      <p class="subtitle">Dobrodošli natrag! Unesite podatke za pristup sustavu.</p>

      <transition name="fade">
        <div v-if="successMessage" class="alert success">{{ successMessage }}</div>
      </transition>
      <transition name="fade">
        <div v-if="errorMessage" class="alert error">{{ errorMessage }}</div>
      </transition>

      <form @submit.prevent="login" class="login-form">
        <div class="form-field">
          <label>Email adresa</label>
          <input type="email" v-model="email" required placeholder="unesite email" />
        </div>

        <div class="form-field">
          <label>Lozinka</label>
          <input
            type="password"
            v-model="password"
            required
            placeholder="unesite lozinku"
          />
        </div>

        <button type="submit" class="primary-btn" :disabled="loading">
          {{ loading ? '⏳ Prijavljivanje...' : '🔓 Prijava' }}
        </button>
      </form>

      <p class="register-link">
        Nemaš račun?
        <router-link to="/register">Registriraj se ovdje</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const email = ref('')
const password = ref('')
const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

async function login() {
  successMessage.value = ''
  errorMessage.value = ''
  loading.value = true

  try {
    const res = await fetch(`${import.meta.env.VITE_API}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value })
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error || 'Greška prilikom prijave.')
    }

    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))

    successMessage.value = '✅ Uspješna prijava!'
    setTimeout(() => {
      window.location.href = '/'
    }, 1000)
  } catch (err) {
    errorMessage.value = '❌ ' + err.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.page-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 90vh;
  background: linear-gradient(145deg, #f2f6ff, #e9efff);
}

.login-card {
  background: #fff;
  padding: 2.5rem;
  border-radius: 16px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
}

h1 {
  margin-bottom: 0.3rem;
  font-size: 2rem;
  color: #1a237e;
}
.subtitle {
  color: #555;
  font-size: 1rem;
  margin-bottom: 1.8rem;
}

/* ===== FORM ===== */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  text-align: left;
}
.form-field label {
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
  display: block;
}
.form-field input {
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 1rem;
  transition: border 0.2s, box-shadow 0.2s;
}
.form-field input:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.15);
  outline: none;
}

/* ===== BUTTON ===== */
.primary-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: background 0.25s, transform 0.1s;
}
.primary-btn:hover {
  background: #0056b3;
  transform: scale(1.02);
}
.primary-btn:disabled {
  background: #b0c4de;
  cursor: not-allowed;
}

/* ===== ALERTS ===== */
.alert {
  padding: 10px 12px;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-weight: 500;
  text-align: center;
}
.success {
  background: #d4edda;
  color: #155724;
}
.error {
  background: #f8d7da;
  color: #721c24;
}

/* ===== LINK ===== */
.register-link {
  margin-top: 1.2rem;
  color: #444;
  font-size: 0.95rem;
}
.register-link a {
  color: #007bff;
  text-decoration: none;
  font-weight: 600;
}
.register-link a:hover {
  text-decoration: underline;
}

/* ===== ANIMATIONS ===== */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.fade-in {
  animation: fadeIn 0.4s ease forwards;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
