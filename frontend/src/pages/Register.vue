<template>
  <div class="page-container">
    <div class="register-card fade-in">
      <h1>🧾 Registracija</h1>
      <p class="subtitle">Kreiraj svoj račun i pridruži se kviz zajednici!</p>

      <transition name="fade">
        <div v-if="msg" :class="msgType" class="alert">{{ msg }}</div>
      </transition>

      <form @submit.prevent="register" class="register-form">
        <div class="form-field">
          <label>Korisničko ime</label>
          <input
            v-model="username"
            placeholder="unesite korisničko ime"
            required
          />
        </div>

        <div class="form-field">
          <label>Email adresa</label>
          <input
            v-model="email"
            type="email"
            placeholder="unesite email"
            required
          />
        </div>

        <div class="form-field">
          <label>Lozinka</label>
          <input
            v-model="password"
            type="password"
            placeholder="unesite lozinku"
            required
          />
        </div>

        <button class="primary-btn" type="submit" :disabled="loading">
          {{ loading ? '⏳ Kreiranje računa...' : '📝 Registriraj se' }}
        </button>
      </form>

      <p class="login-link">
        Već imaš račun?
        <router-link to="/login">Prijavi se ovdje</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const username = ref('')
const email = ref('')
const password = ref('')
const msg = ref('')
const msgType = ref('')
const loading = ref(false)

async function register() {
  msg.value = ''
  msgType.value = ''
  loading.value = true

  try {
    const res = await fetch(`${import.meta.env.VITE_API}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username.value,
        email: email.value,
        password: password.value
      })
    })

    const json = await res.json()
    if (!res.ok) throw new Error(json.error || 'Greška pri registraciji.')

    msg.value = '✅ Registracija uspješna! Sada se možeš prijaviti.'
    msgType.value = 'success'
    username.value = ''
    email.value = ''
    password.value = ''

    // Automatski preusmjeri nakon 2 sekunde
    setTimeout(() => {
      window.location.href = '/login'
    }, 2000)
  } catch (err) {
    msg.value = '❌ ' + err.message
    msgType.value = 'error'
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

.register-card {
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
.register-form {
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
.login-link {
  margin-top: 1.2rem;
  color: #444;
  font-size: 0.95rem;
}
.login-link a {
  color: #007bff;
  text-decoration: none;
  font-weight: 600;
}
.login-link a:hover {
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
