
import { Router } from 'express'
import { pool } from '../db.js'
import { auth, requireRole } from '../mw/auth.js'

export const r = Router()

r.get('/', async (req,res)=>{
  const [rows] = await pool.query('SELECT * FROM events ORDER BY scheduled_at DESC')
  res.json(rows)
})

r.post('/', auth(), requireRole('ADMIN','SUPERADMIN'), async (req,res)=>{
  const { title, scheduled_at, status } = req.body
  const [ins] = await pool.query("INSERT INTO events (title, scheduled_at, status, created_at) VALUES (?,?,?,NOW())",[title,scheduled_at,status||'draft'])
  await pool.query("INSERT INTO quizzes (event_id, title, created_at) VALUES (?, 'Glavni kviz', NOW())",[ins.insertId])
  res.json({ id: ins.insertId })
})

r.put('/:id', auth(), requireRole('ADMIN','SUPERADMIN'), async (req,res)=>{
  const { title, scheduled_at, status } = req.body
  await pool.query('UPDATE events SET title=?, scheduled_at=?, status=? WHERE id=?',[title,scheduled_at,status,req.params.id])
  res.json({ ok:true })
})

r.delete('/:id', auth(), requireRole('ADMIN','SUPERADMIN'), async (req,res)=>{
  await pool.query('DELETE FROM events WHERE id=?',[req.params.id])
  res.json({ ok:true })
})

export default r
