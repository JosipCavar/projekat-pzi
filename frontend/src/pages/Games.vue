<template>
  <div class="page-container">
    <div class="header">
      <h1>🎮 Igre u ponudi</h1>
      <p class="subtitle">Odaberi igru i rezerviraj svoje mjesto!</p>
    </div>

    <div v-if="loading" class="info">⏳ Učitavanje igara...</div>
    <div v-if="error" class="error-msg">{{ error }}</div>

    <div v-if="!loading && games.length === 0" class="info">
      Trenutno nema dostupnih igara.
    </div>

    <div v-if="games.length > 0" class="games-grid fade-in">
      <div v-for="g in games" :key="g.id" class="card hover-card">
        <div class="game-icon">🎲</div>
        <h3 class="game-name">{{ g.name }}</h3>
        <p class="game-desc">{{ g.description || 'Zabavna društvena igra za sve uzraste.' }}</p>
        <button class="primary-btn" @click="goToReservations(g.name)">
          🕹️ Rezerviraj igru
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const games = ref([])
const loading = ref(true)
const error = ref('')
const router = useRouter()

onMounted(async () => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/reservations/games`)
    if (!res.ok) throw new Error('Ne mogu dohvatiti igre.')
    games.value = await res.json()
  } catch (err) {
    error.value = '❌ ' + err.message
  } finally {
    loading.value = false
  }
})

function goToReservations(name) {
  router.push('/reservations')
}
</script>

<style scoped>
.page-container {
  max-width: 900px;
  margin: 2rem auto;
  padding: 1.5rem;
  background: linear-gradient(145deg, #f2f6ff, #e9efff);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

/* ===== HEADER ===== */
.header {
  text-align: center;
  margin-bottom: 2rem;
}
.header h1 {
  font-size: 2.4rem;
  margin: 0;
  color: #222;
}
.subtitle {
  color: #555;
  font-size: 1.1rem;
  margin-top: 0.3rem;
}

/* ===== GRID ===== */
.games-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

/* ===== CARD ===== */
.card {
  background: #fff;
  border-radius: 14px;
  padding: 1.6rem 1.4rem;
  text-align: center;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.25s, box-shadow 0.25s;
}
.hover-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.18);
}
.game-icon {
  font-size: 3rem;
  margin-bottom: 0.6rem;
}
.game-name {
  font-size: 1.4rem;
  font-weight: 600;
  color: #1a237e;
  margin-bottom: 0.4rem;
}
.game-desc {
  color: #444;
  font-size: 0.95rem;
  margin-bottom: 1rem;
}

/* ===== BUTTON ===== */
.primary-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: background 0.25s, transform 0.1s;
}
.primary-btn:hover {
  background: #0056b3;
  transform: scale(1.03);
}

/* ===== INFO & ERROR ===== */
.info {
  text-align: center;
  opacity: 0.7;
  font-style: italic;
  font-size: 1rem;
  color: #555;
}
.error-msg {
  background: #f8d7da;
  color: #721c24;
  padding: 12px;
  border-radius: 10px;
  text-align: center;
  margin-bottom: 1.5rem;
  box-shadow: 0 3px 8px rgba(255, 0, 0, 0.1);
}

/* ===== ANIMATION ===== */
.fade-in {
  animation: fadeIn 0.4s ease forwards;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
