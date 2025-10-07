import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import cors from 'cors'
import { cfg } from './config.js'

// 🔹 Uvoz ruta
import auth from './routes/auth.js'
import events from './routes/events.js'
import quizzes from './routes/quizzes.js'
import reservations from './routes/reservations.js'
import users from './routes/users.js'

const app = express()

// 🧱 Middleware
app.use(helmet())
app.use(express.json())
app.use(
  cors({
    origin: cfg.corsOrigin || 'http://localhost:5173',
    credentials: true
  })
)
app.use(morgan('dev'))

// ✅ Testna ruta za provjeru API-ja
app.get('/', (req, res) =>
  res.json({
    ok: true,
    name: 'PUB Kviz API',
    version: '1.0.0',
    message: 'API radi ispravno 🎯'
  })
)

// ✅ API rute
app.use('/api/auth', auth)
app.use('/api/events', events)
app.use('/api/quizzes', quizzes)
app.use('/api/reservations', reservations)
app.use('/api/users', users)

// ⚠️ Catch-all za nepostojeće rute (404)
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
