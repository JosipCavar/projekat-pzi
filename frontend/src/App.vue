
<template>
  <nav>
    <strong>PubQuiz</strong>
    <a href="/" @click.prevent="$router.push('/')">Početna</a>
    <a href="/teams" @click.prevent="$router.push('/teams')">Timovi</a>
    <a href="/games" @click.prevent="$router.push('/games')">Igre</a>
    <a href="/reservations" @click.prevent="$router.push('/reservations')">Rezervacije</a>
    <span style="margin-left:auto"></span>
    <a href="/login" @click.prevent="$router.push('/login')">Prijava</a>
    <a href="/register" @click.prevent="$router.push('/register')">Registracija</a>
  </nav>
  <div class="container">
    <RouterView/>
  </div>
</template>
<script setup>
</script>
