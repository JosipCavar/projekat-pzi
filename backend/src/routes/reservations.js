
import { Router } from 'express'
import { pool } from '../db.js'
import { auth, requireRole } from '../mw/auth.js'

export const r = Router()

r.get('/games', async (req,res)=>{
  const [rows] = await pool.query('SELECT * FROM games ORDER BY name ASC')
  res.json(rows)
})

r.post('/', auth(), async (req,res)=>{
  const { game_id, reserved_for } = req.body
  const uid = req.user.id
  const [ins] = await pool.query("INSERT INTO reservations (user_id,game_id,reserved_for,status,created_at) VALUES (?,?,?,'pending',NOW())",[uid,game_id,reserved_for])
  res.json({ id: ins.insertId })
})

r.get('/mine', auth(), async (req,res)=>{
  const [rows] = await pool.query("SELECT r.*, g.name AS game_name FROM reservations r LEFT JOIN games g ON g.id=r.game_id WHERE r.user_id=? ORDER BY reserved_for DESC",[req.user.id])
  res.json(rows)
})

r.post('/status/:id', auth(), requireRole('ADMIN','SUPERADMIN'), async (req,res)=>{
  const { status } = req.body
  await pool.query('UPDATE reservations SET status=? WHERE id=?',[status,req.params.id])
  res.json({ ok:true })
})

export default r
