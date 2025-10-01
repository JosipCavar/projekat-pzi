
import { Router } from 'express'
import { pool } from '../db.js'
import { auth, requireRole } from '../mw/auth.js'

export const r = Router()

r.get('/by-event/:eventId', async (req,res)=>{
  const [rows] = await pool.query('SELECT * FROM quizzes WHERE event_id=?',[req.params.eventId])
  res.json(rows)
})

r.get('/rounds/:quizId', async (req,res)=>{
  const [rows] = await pool.query('SELECT * FROM rounds WHERE quiz_id=? ORDER BY order_no ASC, id ASC',[req.params.quizId])
  res.json(rows)
})

r.post('/rounds', auth(), requireRole('ADMIN','SUPERADMIN'), async (req,res)=>{
  const { quiz_id, title, order_no } = req.body
  const [ins] = await pool.query('INSERT INTO rounds (quiz_id,title,order_no) VALUES (?,?,?)',[quiz_id,title,order_no||0])
  res.json({ id: ins.insertId })
})

r.get('/questions/:roundId', async (req,res)=>{
  const [rows] = await pool.query('SELECT * FROM questions WHERE round_id=? ORDER BY order_no ASC, id ASC',[req.params.roundId])
  res.json(rows)
})

r.post('/questions', auth(), requireRole('ADMIN','SUPERADMIN'), async (req,res)=>{
  const { round_id, text, type, points, order_no } = req.body
  const [ins] = await pool.query('INSERT INTO questions (round_id,text,type,points,order_no) VALUES (?,?,?,?,?)',[round_id,text,type||'single',points||1,order_no||0])
  res.json({ id: ins.insertId })
})

r.get('/options/:questionId', async (req,res)=>{
  const [rows] = await pool.query('SELECT * FROM options WHERE question_id=? ORDER BY id ASC',[req.params.questionId])
  res.json(rows)
})

r.post('/options', auth(), requireRole('ADMIN','SUPERADMIN'), async (req,res)=>{
  const { question_id, text, is_correct } = req.body
  const [ins] = await pool.query('INSERT INTO options (question_id,text,is_correct) VALUES (?,?,?)',[question_id,text,is_correct?1:0])
  res.json({ id: ins.insertId })
})

export default r
