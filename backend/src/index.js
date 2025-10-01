
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import cors from 'cors'
import { cfg } from './config.js'

import auth from './routes/auth.js'
import events from './routes/events.js'
import quizzes from './routes/quizzes.js'
import reservations from './routes/reservations.js'
import users from './routes/users.js'

const app = express()
app.use(helmet())
app.use(express.json())
app.use(cors({ origin: cfg.corsOrigin }))
app.use(morgan('dev'))

app.get('/', (req,res)=> res.json({ ok:true, name:'PUB Kviz API' }))

app.use('/api/auth', auth)
app.use('/api/events', events)
app.use('/api/quizzes', quizzes)
app.use('/api/reservations', reservations)
app.use('/api/users', users)

app.listen(cfg.port, ()=> console.log('API sluša na portu', cfg.port))
