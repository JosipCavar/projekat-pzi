<template>
  <div class="friends-page">
    <h1>👥 Prijatelji</h1>

    <!-- 🔹 Dodaj prijatelja -->
    <section class="add-friend">
      <h3>➕ Dodaj prijatelja</h3>
      <input
        v-model="friendId"
        type="number"
        placeholder="ID korisnika za dodavanje"
        class="friend-input"
      />
      <button @click="addFriend">Pošalji zahtjev</button>
    </section>

    <hr />

    <!-- 🔹 Zahtjevi na čekanju -->
    <section class="pending">
      <h3>⏳ Zahtjevi za prijateljstvo</h3>
      <ul>
        <li v-for="r in requests" :key="r.id" class="request-item">
          <span>{{ r.sender_name }}</span>
          <div class="actions">
            <button class="accept" @click="acceptRequest(r.id)">Prihvati</button>
            <button class="decline" @click="declineRequest(r.id)">Odbij</button>
          </div>
        </li>
      </ul>
      <p v-if="!requests.length">Nema novih zahtjeva.</p>
    </section>

    <hr />

    <!-- 🔹 Popis prijatelja -->
    <section class="friends-list">
      <h3>✅ Popis prijatelja</h3>
      <ul>
        <li v-for="f in friends" :key="f.id">
          {{ f.friend_name }}
        </li>
      </ul>

      <p v-if="!friends.length">Nemaš još prijatelja.</p>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const token = localStorage.getItem('token')
const friendId = ref('')
const friends = ref([])
const requests = ref([])

// 🔹 Dohvati potvrđene prijatelje
async function loadFriends() {
  try {
    const res = await axios.get('http://localhost:4000/api/friends', {
      headers: { Authorization: `Bearer ${token}` }
    })
    friends.value = res.data
  } catch (err) {
    console.error('❌ Greška kod dohvata prijatelja:', err)
  }
}

// 🔹 Dohvati zahtjeve koji čekaju
async function loadRequests() {
  try {
    const res = await axios.get('http://localhost:4000/api/friends/requests', {
      headers: { Authorization: `Bearer ${token}` }
    })
    requests.value = res.data
  } catch (err) {
    console.error('❌ Greška kod zahtjeva:', err)
  }
}

// 🔹 Dodaj prijatelja po ID-u
async function addFriend() {
  if (!friendId.value) return alert('Unesi ID korisnika!')
  try {
    await axios.post(
      'http://localhost:4000/api/friends/add',
      { receiver_id: parseInt(friendId.value) },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    alert('✅ Zahtjev poslan!')
    friendId.value = ''
  } catch (err) {
    alert(err.response?.data?.error || 'Greška pri slanju zahtjeva.')
  }
}

// 🔹 Prihvati zahtjev
async function acceptRequest(id) {
  try {
    await axios.post(
      `http://localhost:4000/api/friends/accept/${id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    )
    alert('✅ Prijateljstvo prihvaćeno!')
    await loadRequests()
    await loadFriends()
  } catch (err) {
    alert(err.response?.data?.error || 'Greška pri prihvaćanju zahtjeva.')
  }
}

// 🔹 Odbij zahtjev
async function declineRequest(id) {
  try {
    await axios.post(
      `http://localhost:4000/api/friends/decline/${id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    )
    alert('❌ Zahtjev odbijen.')
    await loadRequests()
  } catch (err) {
    alert(err.response?.data?.error || 'Greška pri odbijanju zahtjeva.')
  }
}

onMounted(() => {
  loadFriends()
  loadRequests()
})
</script>

<style scoped>
.friends-page {
  max-width: 600px;
  margin: 2rem auto;
  background: #1e1e1e;
  color: #fff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
}

h1, h3 {
  color: #66b3ff;
}

.friend-input {
  padding: 8px;
  margin-right: 10px;
  border-radius: 6px;
  border: none;
}

button {
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

button.accept {
  background: #28a745;
  color: white;
}

button.decline {
  background: #dc3545;
  color: white;
}

button:hover {
  opacity: 0.9;
}

.request-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #2a2a2a;
  padding: 8px 10px;
  border-radius: 6px;
  margin-bottom: 8px;
}

.actions {
  display: flex;
  gap: 6px;
}
</style>
