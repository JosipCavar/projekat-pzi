import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { cfg } from './config.js'

// 🔹 Uvoz svih ruta
import auth from './routes/auth.js'
import events from './routes/events.js'
import quizzes from './routes/quizzes.js'
import reservations from './routes/reservations.js'
import users from './routes/users.js'
import admin from './routes/admin.js'
import friends from './routes/friends.js'
import teams from './routes/teams.js'

const app = express()

// ✅ 1. CORS mora biti prvi middleware (prije helmet)
app.use(
  cors({
    origin: cfg.corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  })
)

// ✅ 2. Zatim sigurnosni middleware
app.use(helmet())

// ✅ 3. JSON parser i logger
app.use(express.json())
app.use(morgan('dev'))

// ✅ 4. Test ruta
app.get('/', (req, res) =>
  res.json({
    ok: true,
    name: 'PUB Kviz API',
    version: '1.0.0',
    message: 'API radi ispravno 🎯'
  })
)

// ✅ 5. API rute
app.use('/api/auth', auth)
app.use('/api/events', events)
app.use('/api/quizzes', quizzes)
app.use('/api/reservations', reservations)
app.use('/api/users', users)
app.use('/api/admin', admin)
app.use('/api/friends', friends)
app.use('/api/teams', teams)

// ⚠️ 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta nije pronađena.' })
})

// ⚠️ Globalni error handler
app.use((err, req, res, next) => {
  console.error('❌ Neočekivana greška:', err)
  res.status(500).json({ error: 'Greška na serveru.' })
})

// 🚀 Pokretanje servera
app.listen(cfg.port, () => {
  console.log(`✅ API sluša na portu ${cfg.port}`)
  console.log(`🌍 Dostupan na: http://localhost:${cfg.port}`)
})
