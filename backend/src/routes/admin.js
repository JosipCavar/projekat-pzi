import { Router } from 'express'
import bcrypt from 'bcrypt'
import db from '../db.js'
import { auth } from '../mw/auth.js'
import { requireRole } from '../mw/roles.js'

export const r = Router()

// 🧠 ADMIN DASHBOARD
r.get('/dashboard', auth(), requireRole('ADMIN', 'SUPERADMIN'), async (req, res) => {
  res.json({ msg: 'Dobrodošli u admin panel!' })
})

/* 
 🧑‍💼 SUPERADMIN može stvarati nove ADMIN korisnike
  PUT /api/admin/create-admin
*/
r.post('/create-admin', auth(), requireRole('SUPERADMIN'), async (req, res) => {
  try {
    const { email, username, password } = req.body

    // Validacija
    if (!email || !username || !password) {
      return res.status(400).json({ error: 'Potrebni su email, korisničko ime i lozinka.' })
    }

    // Provjera postoji li korisnik s istim emailom
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email])
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Korisnik s tim emailom već postoji.' })
    }

    // Hash lozinke
    const hashedPassword = await bcrypt.hash(password, 10)

    // Upis u bazu
    await db.query(
      'INSERT INTO users (email, username, password, user_type) VALUES (?, ?, ?, "ADMIN")',
      [email, username, hashedPassword]
    )

    res.json({ success: true, message: '✅ Administrator uspješno kreiran.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Greška na serveru.' })
  }
})

export default r
