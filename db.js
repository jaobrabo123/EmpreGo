//Conexão com o banco de dados
import pkg from 'pg';
const { Pool } = pkg;

// Importando dotenv
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  user: process.env.DATABASE_USER,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_DB,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT,
  ssl: {
    rejectUnauthorized: false
  }
});

export default pool;
