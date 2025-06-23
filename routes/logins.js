//Imports
import express from 'express';
import pool from '../db.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

//Router
const router = express.Router();

//Secret key para o JWT
const SECRET_KEY = process.env.JWT_SECRET;

//Rota de login
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  try {
    const resultado = await pool.query('SELECT * FROM cadastro_usuarios WHERE email = $1', [email]);
    const usuario = resultado.rows[0];

    if (usuario && await bcrypt.compare(senha, usuario.senha)) {
      const token = jwt.sign({ id: usuario.id_usuario }, SECRET_KEY, { expiresIn: '1d' });
      res.json({ token });
    } else {
      res.status(401).send('Email ou senha inválidos.');
    }
  } catch (error) {
    res.status(500).send('Erro ao fazer login: ' + error.message);
  }
});

export default router;