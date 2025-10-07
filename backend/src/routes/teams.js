// backend/src/routes/teams.js
import { Router } from 'express'
import { auth } from '../mw/auth.js'
import db from '../db.js'

const r = Router()

// 🔹 Dohvati sve timove korisnika
r.get('/', auth(), async (req, res) => {
  try {
    const [teams] = await db.query(
      `SELECT t.id, t.name
       FROM teams t
       JOIN team_members tm ON tm.team_id = t.id
       WHERE tm.user_id = ?`,
      [req.user.id]
    )

    // Dohvati i članove svakog tima
    for (let team of teams) {
      const [members] = await db.query(
        `SELECT u.id, u.username, u.email
         FROM users u
         JOIN team_members tm ON tm.user_id = u.id
         WHERE tm.team_id = ?`,
        [team.id]
      )
      team.members = members
    }

    res.json(teams)
  } catch (err) {
    console.error('❌ Greška kod dohvata timova:', err)
    res.status(500).json({ error: 'Greška kod dohvata timova.' })
  }
})

// 🔹 Kreiraj novi tim
r.post('/', auth(), async (req, res) => {
  const { name } = req.body
  if (!name) return res.status(400).json({ error: 'Naziv tima je obavezan.' })

  try {
    // ✅ Popravljeno: koristi se ispravan stupac "owner_id"
    const [result] = await db.query(
      'INSERT INTO teams (name, owner_id) VALUES (?, ?)',
      [name, req.user.id]
    )

    const teamId = result.insertId

    // Dodaj kreatora u članove tima
    await db.query(
      'INSERT INTO team_members (team_id, user_id) VALUES (?, ?)',
      [teamId, req.user.id]
    )

    res.json({ success: true, id: teamId, name })
  } catch (err) {
    console.error('❌ Greška kod stvaranja tima:', err)
    res.status(500).json({ error: 'Greška kod stvaranja tima.' })
  }
})

// 🔹 Dodaj člana u tim
r.post('/:teamId/add', auth(), async (req, res) => {
  const { user_id } = req.body
  const { teamId } = req.params

  if (!user_id) return res.status(400).json({ error: 'user_id je obavezan.' })

  try {
    // Provjeri ima li korisnik pravo dodavati članove (mora biti član tima)
    const [check] = await db.query(
      'SELECT * FROM team_members WHERE team_id = ? AND user_id = ?',
      [teamId, req.user.id]
    )

    if (!check.length) {
      return res.status(403).json({ error: 'Nemaš dozvolu za ovaj tim.' })
    }

    // Dodaj novog člana
    await db.query(
      'INSERT IGNORE INTO team_members (team_id, user_id) VALUES (?, ?)',
      [teamId, user_id]
    )

    res.json({ success: true, msg: 'Član dodan u tim.' })
  } catch (err) {
    console.error('❌ Greška kod dodavanja člana:', err)
    res.status(500).json({ error: 'Greška kod dodavanja člana.' })
  }
})

export default r
