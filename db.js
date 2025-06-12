import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: 'postgres',
  host: 'centerbeam.proxy.rlwy.net',
  database: 'railway',
  password: 'XLdfVvechoojLsqIrBAqCSyKXVgRFnGf', // ou a senha correta, se diferente
  port: 31220,
  ssl: {
    rejectUnauthorized: false
  }
});

export default pool;
