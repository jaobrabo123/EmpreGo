//Conexão com o banco de dados
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: 'postgres',
  host: 'centerbeam.proxy.rlwy.net',
  database: 'railway',
  password: 'XLdfVvechoojLsqIrBAqCSyKXVgRFnGf',
  port: 31220,
  ssl: {
    rejectUnauthorized: false
  }
});

export default pool;
