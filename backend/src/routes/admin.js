import { Router } from 'express'
import { auth } from '../mw/auth.js'
import { requireRole } from '../mw/roles.js'

export const r = Router()

r.get('/dashboard', auth(), requireRole('ADMIN', 'SUPERADMIN'), async (req,res)=>{
  res.json({ msg: 'Dobrodošli u admin panel!' })
})

export default r
