import { Router } from 'express'
import { pool } from '../db.js'
import { auth, requireRole } from '../mw/auth.js'

export const r = Router()

console.log("✅ reservations.js uspješno učitan")

// 🎮 Dohvati sve igre
r.get('/games', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM games ORDER BY name ASC')
    res.json(rows)
  } catch (err) {
    console.error('❌ Greška kod dohvaćanja igara:', err)
    res.status(500).json({ error: 'Greška kod dohvaćanja igara.' })
  }
})

// 🕐 Kreiraj rezervaciju za igru
r.post('/', auth(), async (req, res) => {
  const { game_id, reserved_for } = req.body
  const uid = req.user.id

  const when = new Date(reserved_for)
  const now = new Date()

  if (isNaN(when.getTime())) {
    return res.status(400).json({ error: 'Neispravan format datuma.' })
  }

  if (when <= now) {
    return res.status(400).json({ error: 'Datum rezervacije mora biti u budućnosti.' })
  }

  try {
    const [ins] = await pool.query(
      "INSERT INTO reservations (user_id, game_id, reserved_for, status, created_at) VALUES (?,?,?,'pending',NOW())",
      [uid, game_id, reserved_for]
    )
    res.json({ id: ins.insertId })
  } catch (err) {
    console.error('❌ Greška prilikom spremanja rezervacije:', err)
    res.status(500).json({ error: 'Greška prilikom spremanja rezervacije.' })
  }
})

// 👤 Dohvati rezervacije trenutnog korisnika (igre + eventi)
r.get('/mine', auth(), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
         r.*, 
         g.name AS game_name,
         e.title AS event_name
       FROM reservations r
       LEFT JOIN games g ON g.id = r.game_id
       LEFT JOIN events e ON e.id = r.event_id
       WHERE r.user_id = ?
       ORDER BY r.reserved_for DESC`,
      [req.user.id]
    )
    res.json(rows)
  } catch (err) {
    console.error('❌ Greška prilikom dohvaćanja rezervacija:', err)
    res.status(500).json({ error: 'Greška prilikom dohvaćanja rezervacija.' })
  }
})

// 🧾 Dohvati SVE rezervacije (ADMIN / SUPERADMIN)
r.get('/all', auth(), requireRole('ADMIN', 'SUPERADMIN'), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
         r.*, 
         g.name AS game_name,
         e.title AS event_name,
         u.username
       FROM reservations r
       LEFT JOIN games g ON g.id = r.game_id
       LEFT JOIN events e ON e.id = r.event_id
       LEFT JOIN users u ON u.id = r.user_id
       ORDER BY r.reserved_for DESC`
    )
    res.json(rows)
  } catch (err) {
    console.error('❌ Greška prilikom dohvaćanja svih rezervacija:', err)
    res.status(500).json({ error: 'Greška prilikom dohvaćanja svih rezervacija.' })
  }
})

// 🛠️ Promjena statusa rezervacije (korisnik može otkazati SAMO svoju, admin sve)
r.post('/status/:id', auth(), async (req, res) => {
  const { status } = req.body
  const rid = req.params.id
  const uid = req.user.id
  const isAdmin = ['ADMIN', 'SUPERADMIN'].includes(req.user.user_type)

  try {
    const [rows] = await pool.query('SELECT user_id FROM reservations WHERE id=?', [rid])
    if (!rows.length) return res.status(404).json({ error: 'Rezervacija ne postoji.' })

    const reservation = rows[0]
    if (!isAdmin && reservation.user_id !== uid) {
      return res.status(403).json({ error: 'Nemate ovlasti za izmjenu ove rezervacije.' })
    }

    await pool.query('UPDATE reservations SET status=? WHERE id=?', [status, rid])
    res.json({ ok: true })
  } catch (err) {
    console.error('❌ Greška prilikom promjene statusa:', err)
    res.status(500).json({ error: 'Greška prilikom promjene statusa rezervacije.' })
  }
})

// 🆕 🎉 Rezervacija mjesta za EVENT (uključuje reaktivaciju otkazanih rezervacija i podršku za stare zapise)
r.post('/event/:id', auth(), async (req, res) => {
  const uid = req.user.id
  const event_id = req.params.id

  try {
    // 🔍 Provjeri postoji li event
    const [event] = await pool.query('SELECT * FROM events WHERE id=?', [event_id])
    if (!event.length) {
      return res.status(404).json({ error: 'Event ne postoji.' })
    }
    const e = event[0]

    // 🚫 Ako je event zatvoren
    if (e.status === 'closed') {
      return res.status(400).json({ error: 'Event je zatvoren za rezervacije.' })
    }

    // 🚫 Ako korisnik već ima AKTIVNU rezervaciju (nova provjera uključuje i stare zapise bez event_id)
    const [active] = await pool.query(
      `SELECT id FROM reservations 
       WHERE user_id=? 
       AND (event_id=? OR reserved_for=?) 
       AND status IN ('pending','confirmed') 
       LIMIT 1`,
      [uid, event_id, e.scheduled_at]
    )
    if (active.length > 0) {
      return res.status(400).json({ error: 'Već ste rezervirali ovaj event.' })
    }

    // ✅ Ako postoji OTKAZANA rezervacija — reaktiviraj je (bilo da ima event_id ili ne)
    const [cancelled] = await pool.query(
      `SELECT id FROM reservations 
       WHERE user_id=? 
       AND (event_id=? OR reserved_for=?) 
       AND status='cancelled' 
       ORDER BY id DESC LIMIT 1`,
      [uid, event_id, e.scheduled_at]
    )

    if (cancelled.length > 0) {
      const rid = cancelled[0].id
      await pool.query(
        `UPDATE reservations 
         SET status='pending', event_id=?, reserved_for=?, created_at=NOW() 
         WHERE id=?`,
        [event_id, e.scheduled_at, rid]
      )
      return res.json({ ok: true, id: rid, event_title: e.title, reactivated: true })
    }

    // ✅ Ako nema stare — napravi novu
    const [ins] = await pool.query(
      "INSERT INTO reservations (user_id, event_id, reserved_for, status, created_at) VALUES (?,?,?,'pending',NOW())",
      [uid, event_id, e.scheduled_at]
    )

    res.json({ ok: true, id: ins.insertId, event_title: e.title })
  } catch (err) {
    console.error('❌ Greška prilikom rezervacije eventa:', err)
    res.status(500).json({ error: 'Greška prilikom rezervacije eventa.' })
  }
})

console.log("✅ Ruta /event/:id registrirana")

export default r
