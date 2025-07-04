//Imports
const express = require('express');
const pool = require('../db.js');
const { popularTabelaCandidatos } = require('../app.js');

//router
const router = express.Router();

//Rota de cadastro
router.post('/candidatos', async (req, res) => {
  try {
    const { nome, email, senha, genero, data_nasc } = req.body;
    const { rows } = await pool.query('SELECT 1 FROM candidatos WHERE email = $1', [email]);

    if (rows.length > 0) {
      return res.status(400).json({ error: 'Email já cadastrado.' });
    }

    await popularTabelaCandidatos(nome, email, senha, genero, data_nasc);

    res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao cadastrar usuário: ' + error.message });
  }
});

//Rota para pegar todos os usuários
router.get('/candidatos', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT id, nome, email, genero, data_nasc FROM candidatos');
    res.json(resultado.rows);
  } catch (error) {
    console.error('Erro no GET /usuarios:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários: ' + error.message });
  }
});

module.exports = router;