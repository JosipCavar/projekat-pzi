<template>
  <div class="page-container">
    <div class="header">
      <h1>🎲 Rezervacije</h1>
      <p class="subtitle">
        {{ isAdmin
          ? 'Pregled svih rezervacija u sustavu.'
          : 'Pregledaj i upravljaj svojim rezervacijama.' }}
      </p>
    </div>

    <!-- 🆕 NOVA REZERVACIJA (samo za korisnike) -->
    <div v-if="userType === 'KORISNIK'" class="card form-card">
      <h2>➕ Nova rezervacija</h2>
      <div class="form-grid">
        <div class="form-field">
          <label>Igra</label>
          <select v-model="game_id" required>
            <option value="">Odaberi igru</option>
            <option v-for="g in games" :key="g.id" :value="g.id">
              {{ g.name }}
            </option>
          </select>
        </div>

        <div class="form-field">
          <label>Termin</label>
          <input
            type="datetime-local"
            v-model="reserved_for"
            :min="minDateTime"
            required
          />
        </div>
      </div>

      <button class="primary-btn" @click="reserve" :disabled="loading">
        {{ loading ? '⏳ Spremanje...' : '📅 Rezerviraj' }}
      </button>

      <transition name="fade">
        <p v-if="msg" :class="msgType" class="feedback">{{ msg }}</p>
      </transition>
    </div>

    <!-- 📋 POPIS REZERVACIJA -->
    <div class="reservations-list fade-in">
      <h2>
        {{ userType === 'KORISNIK' ? '📜 Moje rezervacije' : '📋 Sve rezervacije' }}
      </h2>

      <div v-if="mine.length === 0" class="info">Nema rezervacija.</div>

      <div v-for="r in mine" :key="r.id" class="card hover-card res-card">
        <div class="res-info">
          <h3 class="res-title">
            <template v-if="r.game_name">🎮 {{ r.game_name }}</template>
            <template v-else-if="r.event_name">🎟️ {{ r.event_name }}</template>
            <template v-else>❔ Nepoznato</template>
          </h3>
          <p class="res-date">📅 {{ formatDate(r.reserved_for) }}</p>
          <p v-if="isAdmin" class="res-user">👤 {{ r.username || 'Nepoznat korisnik' }}</p>
        </div>

        <div class="res-actions">
          <span class="status" :class="r.status">{{ statusText(r.status) }}</span>
          <button
            v-if="r.status !== 'cancelled'"
            class="cancel-btn"
            @click="cancelReservation(r.id)"
          >
            ❌ Otkaži
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const games = ref([])
const mine = ref([])
const game_id = ref('')
const reserved_for = ref('')
const msg = ref('')
const msgType = ref('')
const loading = ref(false)
const token = localStorage.getItem('token') || ''
const user = JSON.parse(localStorage.getItem('user') || '{}')
const userType = user.user_type || 'KORISNIK'
const isAdmin = ['ADMIN', 'SUPERADMIN'].includes(userType)

// ⏰ Minimalni datum
const minDateTime = computed(() => {
  const now = new Date()
  now.setSeconds(0, 0)
  const pad = n => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
    now.getDate()
  )}T${pad(now.getHours())}:${pad(now.getMinutes())}`
})

// 📅 Format datuma
function formatDate(date) {
  return new Date(date).toLocaleString('hr-HR', {
    dateStyle: 'medium',
    timeStyle: 'short'
  })
}

// 🏷️ Status text
function statusText(status) {
  return status === 'confirmed'
    ? 'Potvrđeno'
    : status === 'pending'
    ? 'Na čekanju'
    : 'Otkazano'
}

// ✅ Nova rezervacija
async function reserve() {
  msg.value = ''
  msgType.value = ''
  loading.value = true

  const when = new Date(reserved_for.value)
  if (isNaN(when.getTime()) || when <= new Date()) {
    msg.value = '⚠️ Datum mora biti u budućnosti.'
    msgType.value = 'error'
    loading.value = false
    return
  }

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/reservations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token
      },
      body: JSON.stringify({
        game_id: Number(game_id.value),
        reserved_for: reserved_for.value
      })
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || 'Greška prilikom spremanja.')

    msg.value = '✅ Rezervacija uspješno spremljena!'
    msgType.value = 'success'
    reserved_for.value = ''
    game_id.value = ''
    await loadMine()
  } catch (err) {
    msg.value = '❌ ' + err.message
    msgType.value = 'error'
  } finally {
    loading.value = false
  }
}

// 📦 Dohvati igre
async function loadGames() {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/reservations/games`)
    if (!res.ok) throw new Error('Ne mogu dohvatiti igre.')
    games.value = await res.json()
  } catch (err) {
    msg.value = '❌ ' + err.message
    msgType.value = 'error'
  }
}

// 📜 Dohvati rezervacije
async function loadMine() {
  if (!token) return
  const endpoint = isAdmin
    ? `${import.meta.env.VITE_API_URL}/api/reservations/all`
    : `${import.meta.env.VITE_API_URL}/api/reservations/mine`

  const res = await fetch(endpoint, {
    headers: { Authorization: 'Bearer ' + token }
  })
  const all = await res.json()
  mine.value = isAdmin ? all : all.filter(r => r.status !== 'cancelled')
}

// ❌ Otkazivanje
async function cancelReservation(id) {
  if (!confirm('Jeste li sigurni da želite otkazati ovu rezervaciju?')) return

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/reservations/status/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token
      },
      body: JSON.stringify({ status: 'cancelled' })
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || 'Neuspješno otkazivanje.')

    mine.value = mine.value.filter(r => r.id !== id)
    msg.value = '🗑️ Rezervacija je otkazana.'
    msgType.value = 'success'
  } catch (err) {
    msg.value = '❌ ' + err.message
    msgType.value = 'error'
  }
}

onMounted(async () => {
  await loadGames()
  await loadMine()
})
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
  color: #222;
  margin: 0;
}
.subtitle {
  color: #555;
  font-size: 1.1rem;
  margin-top: 0.3rem;
}

/* ===== FORM ===== */
.form-card {
  background: #fff;
  padding: 2rem;
  border-radius: 14px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}
.form-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
}
.form-field {
  flex: 1 1 260px;
  display: flex;
  flex-direction: column;
}
label {
  font-weight: 600;
  margin-bottom: 6px;
  color: #333;
}
input,
select {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  transition: border 0.2s;
}
input:focus,
select:focus {
  border-color: #007bff;
  outline: none;
}

/* ===== BUTTONS ===== */
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
.cancel-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 7px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.25s, transform 0.1s;
}
.cancel-btn:hover {
  background: #b52b39;
  transform: scale(1.03);
}

/* ===== LIST ===== */
.reservations-list h2 {
  text-align: center;
  margin-bottom: 1rem;
  color: #1a237e;
}
.res-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.res-info {
  text-align: left;
}
.res-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #1a237e;
}
.res-date {
  color: #555;
  font-size: 0.95rem;
}
.res-user {
  font-size: 0.85rem;
  color: #777;
}
.res-actions {
  text-align: right;
}
.status {
  display: inline-block;
  font-weight: 600;
  text-transform: capitalize;
  padding: 5px 12px;
  border-radius: 10px;
  font-size: 0.9rem;
}
.status.pending {
  background: #fff3cd;
  color: #856404;
}
.status.confirmed {
  background: #d4edda;
  color: #155724;
}
.status.cancelled {
  background: #f8d7da;
  color: #721c24;
}

/* ===== FEEDBACK & ANIMATIONS ===== */
.feedback {
  margin-top: 1rem;
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
.info {
  text-align: center;
  opacity: 0.7;
  font-style: italic;
  font-size: 1rem;
  color: #555;
}
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
