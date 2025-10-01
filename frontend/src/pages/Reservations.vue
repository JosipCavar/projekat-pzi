
<template>
  <h2>Rezervacije</h2>
  <div class="card">
    <div class="form-row">
      <div>
        <label>Igra</label>
        <select v-model="game_id">
          <option :value="g.id" v-for="g in games" :key="g.id">{{ g.name }}</option>
        </select>
      </div>
      <div>
        <label>Termin</label>
        <input type="datetime-local" v-model="reserved_for"/>
      </div>
    </div>
    <button class="btn" @click="reserve">Rezerviraj</button>
    <p v-if="msg">{{ msg }}</p>
  </div>

  <div class="card">
    <h3>Moje rezervacije</h3>
    <div v-for="r in mine" :key="r.id" class="card">
      <div>{{ r.game_name }} — {{ new Date(r.reserved_for).toLocaleString() }}</div>
      <small>Status: {{ r.status }}</small>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
const games = ref([]), mine = ref([]), game_id = ref(''), reserved_for = ref(''), msg = ref('')
const token = localStorage.getItem('token') || ''

async function reserve(){
  msg.value=''
  const res = await fetch(import.meta.env.VITE_API + '/reservations', {
    method:'POST',
    headers:{ 'Content-Type':'application/json', 'Authorization':'Bearer ' + token },
    body: JSON.stringify({ game_id: Number(game_id.value), reserved_for: reserved_for.value })
  })
  const json = await res.json()
  msg.value = json.id ? 'Rezervacija spremljena.' : 'Greška'
  await loadMine()
}

async function loadMine(){
  if (!token){ mine.value=[]; return }
  const res = await fetch(import.meta.env.VITE_API + '/reservations/mine', { headers:{ 'Authorization':'Bearer ' + token }})
  mine.value = await res.json()
}

onMounted(async ()=>{
  const gr = await fetch(import.meta.env.VITE_API + '/reservations/games'); games.value = await gr.json()
  await loadMine()
})
</script>
