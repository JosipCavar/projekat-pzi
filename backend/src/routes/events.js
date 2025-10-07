import { Router } from 'express'
import { pool } from '../db.js'
import { auth, requireRole } from '../mw/auth.js'

export const r = Router()

// 🎯 Dohvati sve evente (s brojem rezervacija)
r.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        e.*,
        COUNT(r.id) AS reservations_count
      FROM events e
      LEFT JOIN reservations r ON r.reserved_for = e.scheduled_at
      GROUP BY e.id
      ORDER BY e.scheduled_at DESC
    `)
    res.json(rows)
  } catch (err) {
    console.error('Greška prilikom dohvaćanja evenata:', err)
    res.status(500).json({ error: 'Greška prilikom dohvaćanja evenata.' })
  }
})

// ➕ Dodaj novi event (ADMIN / SUPERADMIN)
r.post('/', auth(), requireRole('ADMIN', 'SUPERADMIN'), async (req, res) => {
  const { title, scheduled_at, status } = req.body

  // 🧠 Validacija unosa
  if (!title || !scheduled_at) {
    return res.status(400).json({ error: 'Naslov i datum su obavezni.' })
  }

  const when = new Date(scheduled_at)
  if (isNaN(when.getTime()) || when <= new Date()) {
    return res.status(400).json({ error: 'Datum mora biti u budućnosti.' })
  }

  try {
    const [ins] = await pool.query(
      "INSERT INTO events (title, scheduled_at, status, created_at) VALUES (?,?,?,NOW())",
      [title, scheduled_at, status || 'draft']
    )

    // Automatski dodaj "Glavni kviz" za taj event
    await pool.query(
      "INSERT INTO quizzes (event_id, title, created_at) VALUES (?, 'Glavni kviz', NOW())",
      [ins.insertId]
    )

    res.json({ id: ins.insertId, ok: true })
  } catch (err) {
    console.error('Greška prilikom dodavanja eventa:', err)
    res.status(500).json({ error: 'Greška prilikom dodavanja eventa.' })
  }
})

// ✏️ Uredi event
r.put('/:id', auth(), requireRole('ADMIN', 'SUPERADMIN'), async (req, res) => {
  const { title, scheduled_at, status } = req.body

  try {
    await pool.query(
      'UPDATE events SET title=?, scheduled_at=?, status=? WHERE id=?',
      [title, scheduled_at, status, req.params.id]
    )
    res.json({ ok: true })
  } catch (err) {
    console.error('Greška prilikom uređivanja eventa:', err)
    res.status(500).json({ error: 'Greška prilikom uređivanja eventa.' })
  }
})

// 🗑️ Obriši event
r.delete('/:id', auth(), requireRole('ADMIN', 'SUPERADMIN'), async (req, res) => {
  try {
    await pool.query('DELETE FROM events WHERE id=?', [req.params.id])
    res.json({ ok: true })
  } catch (err) {
    console.error('Greška prilikom brisanja eventa:', err)
    res.status(500).json({ error: 'Greška prilikom brisanja eventa.' })
  }
})

export default r
