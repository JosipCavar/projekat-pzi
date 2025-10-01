
import jwt from 'jsonwebtoken'
import { cfg } from '../config.js'

export function auth(required=true){
  return (req,res,next)=>{
    const h = req.headers.authorization || ''
    const token = h.startsWith('Bearer ') ? h.slice(7) : null
    if (!token){
      if (required) return res.status(401).json({error:'Niste prijavljeni.'})
      return next()
    }
    try{
      req.user = jwt.verify(token, cfg.jwtSecret)
      next()
    }catch(e){
      return res.status(401).json({error:'Token nevažeći/istekao.'})
    }
  }
}

export function requireRole(...roles){
  return (req,res,next)=>{
    if (!req.user || !roles.includes(req.user.user_type)){
      return res.status(403).json({error:'Zabranjen pristup.'})
    }
    next()
  }
}
