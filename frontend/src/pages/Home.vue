<template>
  <main class="home-page">
    <!-- Hero sekcija -->
    <section class="hero">
      <h1>🎉 Dobrodošli u PUB Kviz</h1>
      <p>Prijavi se, rezerviraj igru i sudjeluj u tjednim kvizovima!</p>
      <RouterLink to="/quizzes" class="btn">Započni sada</RouterLink>
    </section>

    <!-- Nadolazeći događaji -->
    <section class="events-section">
      <h2>📅 Nadolazeći događaji</h2>

      <div v-if="loading" class="info">⏳ Učitavanje događaja...</div>
      <div v-if="error" class="error-msg">{{ error }}</div>

      <div v-if="!loading && events.length === 0" class="empty">
        Trenutno nema nadolazećih događaja.
      </div>

      <div class="events-grid">
        <div v-for="e in events" :key="e.id" class="event-card">
          <div class="event-info">
            <h3 class="event-title">{{ e.title }}</h3>
            <p class="event-date">
              🕒 {{ new Date(e.scheduled_at).toLocaleString() }}
            </p>
          </div>

          <RouterLink to="/events" class="btn-open">OPEN</RouterLink>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const events = ref([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    // 👇 ako tvoj backend endpoint izgleda ovako, koristi /api/events/upcoming
    const res = await fetch(import.meta.env.VITE_API_URL + '/api/events')
    if (!res.ok) throw new Error('Ne mogu dohvatiti događaje.')

    events.value = await res.json()
  } catch (err) {
    error.value = '❌ ' + err.message
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
/* ======== GLAVNI KONTEJNER ======== */
.home-page {
  background-color: #0d1117;
  color: #fff;
  min-height: 100vh;
  padding: 2rem;
}

/* ======== HERO SEKCIJA ======== */
.hero {
  background: linear-gradient(135deg, #007bff, #0056b3);
  text-align: center;
  padding: 3rem 2rem;
  border-radius: 18px;
  margin-bottom: 3rem;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
}

.hero h1 {
  font-size: 2.3rem;
  margin-bottom: 0.8rem;
  font-weight: 700;
}

.hero p {
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  opacity: 0.9;
}

.btn {
  background: #fff;
  color: #0056b3;
  padding: 10px 18px;
  border-radius: 10px;
  text-decoration: none;
  font-weight: bold;
  transition: 0.25s;
}
.btn:hover {
  background: #cce0ff;
}

/* ======== DOGAĐAJI ======== */
.events-section {
  max-width: 900px;
  margin: 0 auto;
}

.events-section h2 {
  text-align: left;
  font-size: 1.6rem;
  margin-bottom: 1.5rem;
  color: #e3e9ff;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.events-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.event-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #161b22;
  border-radius: 12px;
  padding: 1rem 1.5rem;
  box-shadow: 0 3px 10px rgba(255, 255, 255, 0.05);
  transition: all 0.2s ease;
}

.event-card:hover {
  background: #1c2333;
  transform: translateY(-2px);
}

.event-info {
  display: flex;
  flex-direction: column;
}

.event-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #fff;
}

.event-date {
  font-size: 0.95rem;
  opacity: 0.8;
}

/* ======== OPEN GUMB ======== */
.btn-open {
  background: #198754;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: background 0.25s;
}
.btn-open:hover {
  background: #157347;
}

/* ======== STATUSI ======== */
.info {
  text-align: center;
  opacity: 0.8;
}
.error-msg {
  background: #f8d7da;
  color: #721c24;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 1rem;
}
.empty {
  text-align: center;
  font-style: italic;
  opacity: 0.7;
}
</style>
