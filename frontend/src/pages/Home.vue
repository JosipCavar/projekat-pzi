
<template>
  <h2>Početna – nadolazeći događaji</h2>
  <div class="card">
    <div v-if="events.length===0">Nema događaja.</div>
    <div v-for="e in events" :key="e.id" class="card">
      <strong>{{ e.title }}</strong>
      <div>Termin: {{ new Date(e.scheduled_at).toLocaleString() }}</div>
      <small>Status: {{ e.status }}</small>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
const events = ref([])
onMounted(async ()=>{
  const res = await fetch(import.meta.env.VITE_API + '/events')
  const json = await res.json()
  events.value = json
})
</script>
