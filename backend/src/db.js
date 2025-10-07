import mysql from 'mysql2/promise'
import { cfg } from './config.js'

export const pool = mysql.createPool({
  host: cfg.db.host,
  user: cfg.db.user,
  password: cfg.db.password,
  database: cfg.db.database,
  port: cfg.db.port,
  connectionLimit: 10,
  namedPlaceholders: true
})

export default pool // ✅ dodano da pokrije i 'import db'
