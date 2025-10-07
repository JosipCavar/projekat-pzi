import { Router } from 'express'
import { auth } from '../mw/auth.js'
import db from '../db.js'

const r = Router()

// 🔹 Pošalji zahtjev za prijateljstvo
r.post('/add', auth(), async (req, res) => {
  try {
    const sender = req.user.id
    const receiver = req.body.receiver_id

    if (sender == receiver) {
      return res.status(400).json({ error: 'Ne možete poslati zahtjev samom sebi.' })
    }

    // Provjera postoji li već prijateljstvo
    const [exists] = await db.query(
      'SELECT * FROM friends WHERE (user_id=? AND friend_id=?) OR (user_id=? AND friend_id=?)',
      [sender, receiver, receiver, sender]
    )

    if (exists.length) {
      return res.status(400).json({ error: 'Već postoji zahtjev ili prijateljstvo.' })
    }

    await db.query(
      'INSERT INTO friends (user_id, friend_id, status) VALUES (?, ?, "pending")',
      [sender, receiver]
    )

    res.json({ ok: true, msg: 'Zahtjev poslan.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Greška prilikom slanja zahtjeva.' })
  }
})

// 🔹 Dohvati zahtjeve koji čekaju
r.get('/requests', auth(), async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT f.id, u.username AS sender_name
       FROM friends f
       JOIN users u ON f.user_id = u.id
       WHERE f.friend_id = ? AND f.status = 'pending'`,
      [req.user.id]
    )
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Greška prilikom dohvaćanja zahtjeva.' })
  }
})

// 🔹 Prihvati zahtjev
r.post('/accept/:id', auth(), async (req, res) => {
  try {
    const { id } = req.params
    await db.query('UPDATE friends SET status="accepted" WHERE id=?', [id])
    res.json({ ok: true, msg: 'Zahtjev prihvaćen.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Greška prilikom prihvaćanja.' })
  }
})

// 🔹 Odbij zahtjev
r.post('/decline/:id', auth(), async (req, res) => {
  try {
    const { id } = req.params
    await db.query('UPDATE friends SET status="rejected" WHERE id=?', [id])
    res.json({ ok: true, msg: 'Zahtjev odbijen.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Greška prilikom odbijanja.' })
  }
})

// 🔹 Dohvati potvrđene prijatelje
r.get('/', auth(), async (req, res) => {
  try {
    const userId = req.user.id
    const [friends] = await db.query(
      `SELECT 
         f.id,
         CASE 
           WHEN f.user_id = ? THEN u2.username 
           ELSE u1.username 
         END AS friend_name,
         f.status
       FROM friends f
       JOIN users u1 ON f.user_id = u1.id
       JOIN users u2 ON f.friend_id = u2.id
       WHERE (f.user_id = ? OR f.friend_id = ?) AND f.status='accepted'`,
      [userId, userId, userId]
    )
    res.json(friends)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Greška prilikom dohvaćanja prijatelja.' })
  }
})

export default r
