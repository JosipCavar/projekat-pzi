// backend/src/mw/roles.js
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Niste prijavljeni.' });
    }

    // SUPERADMIN ima sve privilegije
    if (req.user.user_type === 'SUPERADMIN') return next();

    // Ako tražena rola nije među dozvoljenima
    if (!roles.includes(req.user.user_type)) {
      return res.status(403).json({ error: 'Zabranjen pristup.' });
    }

    next();
  };
}
