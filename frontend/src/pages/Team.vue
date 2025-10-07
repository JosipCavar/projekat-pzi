<template>
  <div class="teams-page">
    <h1 class="title">👥 Timovi</h1>

    <!-- ✅ Poruka o statusu -->
    <p v-if="msg" :class="msgType" class="feedback">{{ msg }}</p>

    <!-- 🆕 Kreiranje tima -->
    <div class="create-team-card">
      <h2>➕ Stvori novi tim</h2>
      <input v-model="teamName" placeholder="Naziv tima" />
      <button @click="createTeam" :disabled="loading">
        {{ loading ? '⏳ Stvaram...' : 'Kreiraj tim' }}
      </button>
    </div>

    <!-- 📋 Popis timova -->
    <div v-if="teams.length" class="teams-list">
      <h2>📋 Moji timovi</h2>

      <div
        v-for="t in teams"
        :key="t.id"
        class="team-card fade-in"
      >
        <div class="team-header">
          <h3>{{ t.name }}</h3>
          <span class="team-id">#{{ t.id }}</span>
        </div>

        <div class="members">
          <p><strong>Članovi:</strong></p>
          <ul>
            <li v-for="m in t.members" :key="m.id">
              {{ m.username }}
            </li>
          </ul>
        </div>

        <div class="add-member">
          <input
            v-model="memberId"
            placeholder="ID prijatelja za dodavanje"
          />
          <button @click="addMember(t.id)">➕ Dodaj člana</button>
        </div>
      </div>
    </div>

    <div v-else class="empty">Nema timova. Kreiraj svoj prvi tim!</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const token = localStorage.getItem('token')
const teams = ref([])
const teamName = ref('')
const memberId = ref('')
const msg = ref('')
const msgType = ref('')
const loading = ref(false)

// 🔹 Dohvati sve timove korisnika
async function loadTeams() {
  try {
    const res = await fetch(`${import.meta.env.VITE_API}/api/teams`, {
      headers: { Authorization: 'Bearer ' + token }
    })
    const data = await res.json()
    teams.value = data
  } catch (err) {
    msg.value = '❌ Greška prilikom dohvaćanja timova.'
    msgType.value = 'error'
  }
}

// 🔹 Kreiraj novi tim
async function createTeam() {
  if (!teamName.value.trim()) return

  loading.value = true
  msg.value = ''
  try {
    const res = await fetch(`${import.meta.env.VITE_API}/api/teams`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token
      },
      body: JSON.stringify({ name: teamName.value })
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || 'Neuspjelo kreiranje tima.')
    msg.value = '✅ Tim uspješno kreiran!'
    msgType.value = 'success'
    teamName.value = ''
    await loadTeams()
  } catch (err) {
    msg.value = err.message
    msgType.value = 'error'
  } finally {
    loading.value = false
  }
}

// 🔹 Dodaj člana u tim
async function addMember(teamId) {
  if (!memberId.value) return
  try {
    const res = await fetch(`${import.meta.env.VITE_API}/api/teams/${teamId}/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token
      },
      body: JSON.stringify({ user_id: Number(memberId.value) })
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || 'Greška pri dodavanju člana.')
    msg.value = `✅ Korisnik dodan u tim ${teamId}.`
    msgType.value = 'success'
    memberId.value = ''
    await loadTeams()
  } catch (err) {
    msg.value = '❌ ' + err.message
    msgType.value = 'error'
  }
}

onMounted(loadTeams)
</script>

<style scoped>
.teams-page {
  max-width: 900px;
  margin: 2rem auto;
  padding: 1.5rem;
  background: linear-gradient(160deg, #f8f9fa, #eef1f5);
  border-radius: 16px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.1);
}

.title {
  text-align: center;
  font-size: 2rem;
  color: #222;
  margin-bottom: 2rem;
}

/* 🧾 Kreiranje tima */
.create-team-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}
.create-team-card input {
  width: 60%;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ccc;
  margin-right: 8px;
}
.create-team-card button {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease;
}
.create-team-card button:hover {
  background: #0056b3;
}

/* 📋 Popis timova */
.teams-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.team-card {
  background: #fff;
  border-radius: 14px;
  padding: 1.5rem;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
}
.team-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.team-header h3 {
  margin: 0;
  color: #333;
}
.team-id {
  font-size: 0.9rem;
  color: #888;
}

.members ul {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0;
}
.members li {
  background: #f1f5ff;
  padding: 6px 10px;
  border-radius: 6px;
  margin-bottom: 5px;
  color: #333;
  font-weight: 500;
}

.add-member {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-top: 1rem;
}
.add-member input {
  flex: 1;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #ccc;
}
.add-member button {
  background: #28a745;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease;
}
.add-member button:hover {
  background: #1e7e34;
}

/* Poruke */
.feedback {
  text-align: center;
  padding: 10px;
  border-radius: 8px;
  font-weight: 500;
  margin-bottom: 1rem;
}
.success {
  background: #d4edda;
  color: #155724;
}
.error {
  background: #f8d7da;
  color: #721c24;
}
.empty {
  text-align: center;
  font-style: italic;
  color: #555;
}
.fade-in {
  animation: fadeIn 0.4s ease forwards;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
