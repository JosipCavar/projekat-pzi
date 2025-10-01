
<template>
  <h2>Prijava</h2>
  <div class="card">
    <label>E-mail</label>
    <input v-model="email" type="email"/>
    <label>Lozinka</label>
    <input v-model="password" type="password"/>
    <button class="btn" @click="login">Prijava</button>
    <p v-if="msg">{{ msg }}</p>
  </div>
</template>
<script setup>
import { ref } from 'vue'
const email = ref(''), password = ref(''), msg = ref('')
async function login(){
  msg.value=''
  const res = await fetch(import.meta.env.VITE_API + '/auth/login', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ email: email.value, password: password.value })
  })
  const json = await res.json()
  if (json.token){
    localStorage.setItem('token', json.token)
    msg.value='Prijavljen.'
    location.href = '/'
  }else{
    msg.value = json.error || 'Greška pri prijavi'
  }
}
</script>
