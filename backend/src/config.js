import 'dotenv/config'

export const cfg = {
  // Port na kojem backend sluša (Render automatski dodjeljuje)
  port: process.env.PORT || 4000,

  // JWT tajna (ako koristiš autentifikaciju)
  jwtSecret: process.env.JWT_SECRET || 'dev_secret_change_me',

  // Dozvoljeni frontend (CORS origin)
  corsOrigin: process.env.CORS_ORIGIN || 'https://resplendent-pavlova-485144.netlify.app',

  // MySQL baza (Railway)
  db: {
    host: process.env.DB_HOST || 'trolley.proxy.rlwy.net',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'QiwvFiooESehsWQIvFZofsBlQORjcgeB',
    database: process.env.DB_NAME || 'railway',
    port: Number(process.env.DB_PORT || 46822)
  }
}
