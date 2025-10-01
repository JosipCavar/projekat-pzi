
import { Router } from 'express'
import { pool } from '../db.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { body, validationResult } from 'express-validator'
import { cfg } from '../config.js'

export const r = Router()

r.post('/register',
  body('email').isEmail(),
  body('password').isLength({min:6}),
  body('username').isLength({min:2}),
  async (req,res)=>{
    const v = validationResult(req)
    if (!v.isEmpty()) return res.status(400).json({errors:v.array()})
    const {email,password,username} = req.body
    const [ex] = await pool.query('SELECT id FROM users WHERE email=? LIMIT 1',[email])
    if (ex.length) return res.status(400).json({error:'Email je već registriran.'})
    const hash = await bcrypt.hash(password,10)
    await pool.query("INSERT INTO users (email,password,username,user_type,created_at) VALUES (?,?,?,'KORISNIK',NOW())",[email,hash,username])
    res.json({ok:true})
})

r.post('/login', async (req,res)=>{
  const {email,password} = req.body
  const [rows] = await pool.query('SELECT * FROM users WHERE email=? LIMIT 1',[email])
  const u = rows[0]
  if (!u) return res.status(400).json({error:'Neispravni podaci.'})
  const good = await bcrypt.compare(password, u.password)
  if (!good) return res.status(400).json({error:'Neispravni podaci.'})
  const token = jwt.sign({ id:u.id, email:u.email, username:u.username, user_type:u.user_type }, cfg.jwtSecret, { expiresIn:'7d' })
  res.json({ token, user:{ id:u.id, email:u.email, username:u.username, user_type:u.user_type } })
})

export default r
