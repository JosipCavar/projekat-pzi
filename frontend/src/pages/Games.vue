
<template>
  <h2>Igre</h2>
  <div class="card" v-for="g in games" :key="g.id">{{ g.name }}</div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
const games = ref([])
onMounted( async ()=>{
  const res = await fetch(import.meta.env.VITE_API + '/reservations/games')
  games.value = await res.json()
})
</script>
