<template>
  <div class="quiz-page">
    <div class="header">
      <h1>🧠 Tjedni Pub Kviz</h1>
      <p class="subtitle">Provjeri svoje znanje i usporedi se s ostalima!</p>
    </div>

    <!-- 📋 Pitanja -->
    <div v-if="!submitted && !alreadyDone && questions.length" class="quiz-container fade-in">
      <div v-for="q in questions" :key="q.id" class="question-card">
        <h3>{{ q.text }}</h3>
        <div class="options">
          <label v-for="opt in q.options" :key="opt.id" class="option">
            <input type="radio" :name="'q' + q.id" :value="opt.id" v-model="answers[q.id]" />
            <span>{{ opt.text }}</span>
          </label>
        </div>
      </div>

      <button class="primary-btn" @click="submitQuiz" :disabled="loading">
        {{ loading ? "⏳ Predajem..." : "📤 Predaj kviz" }}
      </button>
    </div>

    <!-- ✅ Rezultat -->
    <div v-if="submitted" class="result-card fade-in">
      <h2>✅ Završili ste kviz!</h2>
      <p>Vaš rezultat: <strong>{{ score }}</strong> / {{ questions.length }}</p>
    </div>

    <!-- 🧩 Već riješeno -->
    <div v-else-if="alreadyDone" class="result-card fade-in">
      <h2>🧠 Već ste riješili ovaj kviz!</h2>
      <p>Vaš rezultat: <strong>{{ yourScore }}</strong></p>
    </div>

    <!-- 🏆 Rang lista -->
    <div v-if="leaderboard.length" class="leaderboard fade-in">
      <h2>🏆 Rang lista</h2>
      <table>
        <thead>
          <tr><th>Korisnik</th><th>Bodovi</th></tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in leaderboard" :key="row.username" :class="{ top: i < 3 }">
            <td>{{ i + 1 }}. {{ row.username }}</td>
            <td>{{ row.score }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-if="msg" :class="msgType" class="feedback">{{ msg }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const quiz = ref(null)
const questions = ref([])
const answers = ref({})
const leaderboard = ref([])
const score = ref(0)
const submitted = ref(false)
const msg = ref('')
const msgType = ref('')
const loading = ref(false)
const alreadyDone = ref(false)
const yourScore = ref(0)
const token = localStorage.getItem('token') || ''

// 🔹 Dohvati tjedni kviz
async function loadQuiz() {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/quizzes/weekly`, {
      headers: { Authorization: 'Bearer ' + token }
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || 'Greška kod učitavanja kviza.')

    if (json.alreadyDone) {
      alreadyDone.value = true
      yourScore.value = json.yourScore
      leaderboard.value = json.leaderboard
      return
    }

    quiz.value = json.quiz
    questions.value = json.questions
  } catch (err) {
    msg.value = '❌ ' + err.message
    msgType.value = 'error'
  }
}

// 🔹 Pošalji odgovore
async function submitQuiz() {
  loading.value = true
  msg.value = ''
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/quizzes/submit/${quiz.value.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token
      },
      body: JSON.stringify({ answers: answers.value })
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || 'Neuspjelo slanje kviza.')

    score.value = json.score
    submitted.value = true
    await loadLeaderboard()
  } catch (err) {
    msg.value = '❌ ' + err.message
    msgType.value = 'error'
  } finally {
    loading.value = false
  }
}

// 🔹 Učitaj leaderboard
async function loadLeaderboard() {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/quizzes/leaderboard/${quiz.value.id}`)
  leaderboard.value = await res.json()
}

onMounted(loadQuiz)
</script>

<style>
.quiz-page {
  max-width: 850px;
  margin: 2rem auto;
  padding: 1.5rem;
  background: #0d1117;
  border-radius: 16px;
  color: #e6e6e6;
}

/* ===== HEADER ===== */
.header {
  text-align: center;
  margin-bottom: 2rem;
}
.header h1 {
  font-size: 2.4rem;
  color: #f8f9fa;
}
.subtitle {
  color: #aeb8c4;
  font-size: 1.1rem;
  margin-top: 0.3rem;
}

/* ===== KVIZ BLOK ===== */
.quiz-container {
  background: #1b2333;
  padding: 1.5rem 2rem;
  border-radius: 14px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.question-card {
  background: #222c3c;
  border-radius: 12px;
  padding: 1.3rem 1.6rem;
  margin-bottom: 1.4rem;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
}

.question-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
}

.question-card h3 {
  color: #f0f0f0;
  font-size: 1.25rem;
  font-weight: 600;
}

/* ===== OPCIJE ===== */
.options {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  margin-top: 0.9rem;
}
.option {
  display: flex;
  align-items: center;
  background: #2b3448;
  padding: 0.8rem 1rem;
  border-radius: 10px;
  cursor: pointer;
  color: #e8e8e8;
  transition: background 0.25s, transform 0.1s;
}

.option:hover {
  background: #38445c;
  transform: scale(1.01);
}

.option input[type='radio'] {
  margin-right: 10px;
  accent-color: #007bff;
}

.option span {
  color: #f5f5f5;
  font-size: 1rem;
}

/* ===== GUMB ===== */
.primary-btn {
  display: block;
  margin: 2rem auto 0;
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: white;
  border: none;
  padding: 12px 26px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 600;
  transition: background 0.25s, transform 0.15s;
}
.primary-btn:hover {
  background: linear-gradient(135deg, #1a82ff, #004999);
  transform: scale(1.04);
}

/* ===== REZULTAT ===== */
.result-card {
  text-align: center;
  background: #1b2333;
  padding: 2rem;
  border-radius: 14px;
  margin-top: 2rem;
  border: 2px solid #4caf50;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
}
.result-card h2 {
  color: #00e676;
  font-size: 1.7rem;
  margin-bottom: 0.6rem;
}
.result-card p {
  color: #d6e6f2;
  font-size: 1.2rem;
}

/* ===== LEADERBOARD ===== */
.leaderboard {
  margin-top: 2rem;
  background: #1b2333;
  border-radius: 14px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.25);
  padding: 1rem 1.5rem;
}
.leaderboard h2 {
  text-align: center;
  font-size: 1.6rem;
  margin-bottom: 1rem;
  color: #f8f9fa;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 1.05rem;
}
th {
  background: #007bff;
  color: white;
  padding: 12px;
  font-weight: 600;
}
td {
  padding: 12px;
  text-align: center;
  border-bottom: 1px solid #39445a;
  color: #e0e6ef;
}
tr:nth-child(odd) td {
  background: #202a3c;
}
tr.top td {
  background: #2f3b54;
  font-weight: 700;
}
tr.top:first-child td {
  background: #ffd700;
  color: #1a1a1a;
}
tr.top:nth-child(2) td {
  background: #c0c0c0;
  color: #1a1a1a;
}
tr.top:nth-child(3) td {
  background: #cd7f32;
  color: #fff;
}

/* ===== PORUKE ===== */
.feedback {
  text-align: center;
  margin-top: 1rem;
  font-weight: 500;
  font-size: 1.1rem;
}
.success { color: #28a745; }
.error { color: #dc3545; }

/* ===== ANIMACIJE ===== */
.fade-in {
  animation: fadeIn 0.5s ease forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
