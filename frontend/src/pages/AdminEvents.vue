<template>
  <h2>Admin – Događaji</h2>
  <div class="card">
    <div class="form-row">
      <div>
        <label>Naslov</label>
        <input v-model="title"/>
      </div>
      <div>
        <label>Termin</label>
        <input type="datetime-local" v-model="scheduled_at"/>
      </div>
    </div>
    <div class="form-row">
      <div>
        <label>Status</label>
        <select v-model="status">
          <option value="draft">draft</option>
          <option value="open">open</option>
          <option value="closed">closed</option>
        </select>
      </div>
      <div style="display:flex;align-items:end">
        <button class="btn" @click="create">Dodaj događaj</button>
      </div>
    </div>
    <p v-if="msg">{{ msg }}</p>
  </div>

  <div class="card">
    <h3>Popis događaja</h3>
    <div v-for="e in list" :key="e.id" class="card">
      <div><strong>{{ e.title }}</strong> — {{ new Date(e.scheduled_at).toLocaleString() }}</div>
      <small>Status: {{ e.status }}</small>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
const token = localStorage.getItem('token') || ''
const title = ref(''), scheduled_at = ref(''), status = ref('draft'), msg = ref(''), list = ref([])

async function load(){
  const res = await fetch(import.meta.env.VITE_API_URL + '/events')
  list.value = await res.json()
}
async function create(){
  msg.value=''
  const res = await fetch(import.meta.env.VITE_API_URL + '/events', {
    method:'POST',
    headers:{ 'Content-Type':'application/json', 'Authorization':'Bearer ' + token },
    body: JSON.stringify({ title:title.value, scheduled_at:scheduled_at.value, status:status.value })
  })
  const json = await res.json()
  msg.value = json.id ? 'Dodano.' : (json.error || 'Greška')
  await load()
}
onMounted(load)
</script>
