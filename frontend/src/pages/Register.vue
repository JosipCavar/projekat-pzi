
<template>
  <h2>Registracija</h2>
  <div class="card">
    <label>Korisničko ime</label>
    <input v-model="username"/>
    <label>E-mail</label>
    <input v-model="email" type="email"/>
    <label>Lozinka</label>
    <input v-model="password" type="password"/>
    <button class="btn" @click="register">Kreiraj račun</button>
    <p v-if="msg">{{ msg }}</p>
  </div>
</template>
<script setup>
import { ref } from 'vue'
const username = ref(''), email = ref(''), password = ref(''), msg = ref('')
async function register(){
  msg.value=''
  const res = await fetch(import.meta.env.VITE_API + '/auth/register', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ username: username.value, email: email.value, password: password.value })
  })
  const json = await res.json()
  msg.value = json.ok ? 'Registracija uspješna — možeš se prijaviti.' : (json.error || 'Greška pri registraciji')
}
</script>
