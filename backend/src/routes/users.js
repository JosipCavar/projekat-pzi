
import { Router } from 'express'
import { pool } from '../db.js'
import { auth } from '../mw/auth.js'

export const r = Router()

r.get('/me', auth(), async (req,res)=>{
  const [rows] = await pool.query('SELECT id,email,username,user_type FROM users WHERE id=?',[req.user.id])
  res.json(rows[0] || null)
})

export default r
