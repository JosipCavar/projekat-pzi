import { Router } from 'express'
import { pool } from '../db.js'
import { auth, requireRole } from '../mw/auth.js'

export const r = Router()

// ===========================================
// 🔹 Osnovne rute za kvizove
// ===========================================

r.get('/by-event/:eventId', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM quizzes WHERE event_id=?', [req.params.eventId])
  res.json(rows)
})

r.get('/rounds/:quizId', async (req, res) => {
  const [rows] = await pool.query(
    'SELECT * FROM rounds WHERE quiz_id=? ORDER BY order_no ASC, id ASC',
    [req.params.quizId]
  )
  res.json(rows)
})

r.post('/rounds', auth(), requireRole('ADMIN', 'SUPERADMIN'), async (req, res) => {
  const { quiz_id, title, order_no } = req.body
  const [ins] = await pool.query(
    'INSERT INTO rounds (quiz_id,title,order_no) VALUES (?,?,?)',
    [quiz_id, title, order_no || 0]
  )
  res.json({ id: ins.insertId })
})

r.get('/questions/:roundId', async (req, res) => {
  const [rows] = await pool.query(
    'SELECT * FROM questions WHERE round_id=? ORDER BY order_no ASC, id ASC',
    [req.params.roundId]
  )
  res.json(rows)
})

r.post('/questions', auth(), requireRole('ADMIN', 'SUPERADMIN'), async (req, res) => {
  const { round_id, text, type, points, order_no } = req.body
  const [ins] = await pool.query(
    'INSERT INTO questions (round_id,text,type,points,order_no) VALUES (?,?,?,?,?)',
    [round_id, text, type || 'single', points || 1, order_no || 0]
  )
  res.json({ id: ins.insertId })
})

r.get('/options/:questionId', async (req, res) => {
  const [rows] = await pool.query(
    'SELECT * FROM options WHERE question_id=? ORDER BY id ASC',
    [req.params.questionId]
  )
  res.json(rows)
})

r.post('/options', auth(), requireRole('ADMIN', 'SUPERADMIN'), async (req, res) => {
  const { question_id, text, is_correct } = req.body
  const [ins] = await pool.query(
    'INSERT INTO options (question_id,text,is_correct) VALUES (?,?,?)',
    [question_id, text, is_correct ? 1 : 0]
  )
  res.json({ id: ins.insertId })
})

// ===========================================
// 🧠 WEEKLY QUIZ (Tjedni kviz)
// ===========================================

r.get('/weekly', auth(), async (req, res) => {
  try {
    const [quiz] = await pool.query(`
      SELECT * FROM quizzes q
      WHERE EXISTS (SELECT 1 FROM rounds r WHERE r.quiz_id = q.id)
      ORDER BY q.id DESC
      LIMIT 1
    `)

    if (!quiz.length) {
      return res.status(404).json({ error: 'Nema aktivnog kviza.' })
    }

    const q = quiz[0]

    const [existing] = await pool.query(
      'SELECT id, score FROM quiz_results WHERE quiz_id=? AND user_id=? LIMIT 1',
      [q.id, req.user.id]
    )

    if (existing.length) {
      const [leaderboard] = await pool.query(
        `SELECT u.username, r.score 
         FROM quiz_results r
         JOIN users u ON u.id = r.user_id
         WHERE r.quiz_id=?
         ORDER BY r.score DESC, r.completed_at ASC`,
        [q.id]
      )
      return res.json({
        alreadyDone: true,
        yourScore: existing[0].score,
        leaderboard
      })
    }

    const [questions] = await pool.query(
      `SELECT q.id, q.text AS question_text, o.id AS option_id, o.text AS option_text
       FROM questions q
       JOIN options o ON o.question_id = q.id
       WHERE q.round_id = (
         SELECT id FROM rounds WHERE quiz_id = ? LIMIT 1
       )
       ORDER BY q.order_no, q.id, o.id`,
      [q.id]
    )

    const grouped = {}
    for (const row of questions) {
      if (!grouped[row.id]) grouped[row.id] = { id: row.id, text: row.question_text, options: [] }
      grouped[row.id].options.push({ id: row.option_id, text: row.option_text })
    }

    res.json({ quiz: q, questions: Object.values(grouped) })
  } catch {
    res.status(500).json({ error: 'Greška kod dohvaćanja kviza.' })
  }
})

// ===========================================
// 📝 Predaja kviza i rezultat
// ===========================================

r.post('/submit/:quiz_id', auth(), async (req, res) => {
  const uid = req.user.id
  const { quiz_id } = req.params
  const { answers } = req.body

  try {
    const [exists] = await pool.query(
      'SELECT id FROM quiz_results WHERE quiz_id=? AND user_id=?',
      [quiz_id, uid]
    )
    if (exists.length) {
      return res.status(400).json({ error: 'Već ste riješili ovaj kviz.' })
    }

    const [correct] = await pool.query(
      `SELECT o.id AS option_id, o.question_id
       FROM options o
       JOIN questions q ON q.id = o.question_id
       JOIN rounds r ON r.id = q.round_id
       WHERE o.is_correct = 1 AND r.quiz_id=?`,
      [quiz_id]
    )

    const correctMap = Object.fromEntries(correct.map(o => [o.question_id, o.option_id]))
    let score = 0
    for (const [qid, opt] of Object.entries(answers)) {
      if (String(correctMap[qid]) === String(opt)) score++
    }

    await pool.query('INSERT INTO quiz_results (quiz_id, user_id, score) VALUES (?,?,?)', [
      quiz_id,
      uid,
      score
    ])

    res.json({ ok: true, score })
  } catch {
    res.status(500).json({ error: 'Greška kod predaje kviza.' })
  }
})

// ===========================================
// 🏆 Rang lista
// ===========================================

r.get('/leaderboard/:quiz_id', async (req, res) => {
  const { quiz_id } = req.params
  try {
    const [rows] = await pool.query(
      `SELECT u.username, r.score 
       FROM quiz_results r
       JOIN users u ON u.id = r.user_id
       WHERE r.quiz_id=?
       ORDER BY r.score DESC, r.completed_at ASC`,
      [quiz_id]
    )
    res.json(rows)
  } catch {
    res.status(500).json({ error: 'Greška kod dohvaćanja leaderboarda.' })
  }
})

export default r
