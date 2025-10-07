<template>
  <div class="page-container">
    <div class="header">
      <h1>📅 Nadolazeći Eventi</h1>
      <p class="subtitle">Rezerviraj svoje mjesto i pridruži se zabavi!</p>
    </div>

    <!-- LOADING / ERROR -->
    <div v-if="loading" class="info">⏳ Učitavanje evenata...</div>
    <div v-if="error" class="error-msg">{{ error }}</div>

    <!-- EMPTY -->
    <div v-if="!loading && events.length === 0" class="info">
      Trenutno nema dostupnih evenata.
    </div>

    <!-- EVENTS LIST -->
    <div v-if="events.length > 0" class="events-grid fade-in">
      <div v-for="e in events" :key="e.id" class="card hover-card">
        <div class="event-header">
          <h3 class="event-title">{{ e.title }}</h3>
          <p class="time">🕒 {{ formatDateTime(e.scheduled_at) }}</p>
        </div>

        <p class="status" :class="e.status">
          {{ e.status === 'open' ? 'Otvoreno' : e.status === 'closed' ? 'Zatvoreno' : 'U pripremi' }}
        </p>

        <button
          class="primary-btn"
          @click="reserveEvent(e.id)"
          :disabled="loadingEvent === e.id || e.status !== 'open'"
        >
          {{ loadingEvent === e.id ? '⏳ Spremanje...' : '📥 Rezerviraj mjesto' }}
        </button>
      </div>
    </div>

    <!-- PORUKE -->
    <transition name="fade">
      <p v-if="msg" :class="msgType" class="feedback">{{ msg }}</p>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const events = ref([])
const loading = ref(true)
const error = ref('')
const msg = ref('')
const msgType = ref('')
const token = localStorage.getItem('token') || ''
const loadingEvent = ref(null)

async function loadEvents() {
  try {
    const res = await fetch(`${import.meta.env.VITE_API}/api/events`)
    if (!res.ok) throw new Error('Ne mogu dohvatiti evente.')
    events.value = await res.json()
  } catch (err) {
    error.value = '❌ ' + err.message
  } finally {
    loading.value = false
  }
}

async function reserveEvent(id) {
  msg.value = ''
  msgType.value = ''
  loadingEvent.value = id
  try {
    const res = await fetch(`${import.meta.env.VITE_API}/api/reservations/event/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token
      }
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Greška prilikom rezervacije.')
    msg.value = `✅ Uspješno rezervirano mjesto za "${data.event_title}".`
    msgType.value = 'success'
  } catch (err) {
    msg.value = '❌ ' + err.message
    msgType.value = 'error'
  } finally {
    loadingEvent.value = null
  }
}

function formatDateTime(datetime) {
  return new Date(datetime).toLocaleString('hr-HR', {
    dateStyle: 'long',
    timeStyle: 'short'
  })
}

onMounted(loadEvents)
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
.events-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(270px, 1fr));
}

/* ===== CARD ===== */
.card {
  background: #fff;
  border-radius: 14px;
  padding: 1.5rem;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.25s, box-shadow 0.25s;
}
.hover-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

/* ===== EVENT INFO ===== */
.event-title {
  font-size: 1.4rem;
  color: #1a237e;
  font-weight: 600;
  margin-bottom: 0.3rem;
}
.time {
  color: #555;
  font-size: 0.95rem;
  margin-bottom: 1rem;
}

/* ===== STATUS ===== */
.status {
  display: inline-block;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.85rem;
  padding: 5px 12px;
  border-radius: 12px;
  margin-bottom: 1rem;
}
.status.open {
  background: #d4edda;
  color: #155724;
}
.status.closed {
  background: #f8d7da;
  color: #721c24;
}
.status.draft {
  background: #fff3cd;
  color: #856404;
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
.primary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ===== INFO / ERROR / FEEDBACK ===== */
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
.feedback {
  margin-top: 1.5rem;
  padding: 12px;
  border-radius: 10px;
  text-align: center;
  font-weight: 500;
  font-size: 1.05rem;
  animation: fadeIn 0.4s ease forwards;
}
.success {
  background: #d4edda;
  color: #155724;
}
.error {
  background: #f8d7da;
  color: #721c24;
}

/* ===== ANIMACIJE ===== */
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
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
