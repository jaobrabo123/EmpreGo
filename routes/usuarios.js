//Imports
const express = require('express');
const pool = require('../db.js');
const { popularTabelaUsuarios, criarTabelaUsuariosPerfil } = require('../app.js');

//router
const router = express.Router();

//Rota de cadastro
router.post('/usuarios', async (req, res) => {
  try {
    const { nome, email, senha, genero, datanasc } = req.body;
    const { rows } = await pool.query('SELECT * FROM cadastro_usuarios WHERE email = $1', [email]);

    if (rows.length > 0) {
      return res.status(400).json({ error: 'Email já cadastrado.' });
    }

    await popularTabelaUsuarios(nome, email, senha, genero, datanasc);
    const resultado = await pool.query('SELECT id_usuario FROM cadastro_usuarios WHERE email = $1', [email]);
    const idusuario = resultado.rows[0].id_usuario;
    await criarTabelaUsuariosPerfil(idusuario);

    res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao cadastrar usuário: ' + error.message });
  }
});

//Rota para pegar todos os usuários
router.get('/usuarios', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT id_usuario, nome, email, genero, datanasc FROM cadastro_usuarios');
    res.json(resultado.rows);
  } catch (error) {
    console.error('Erro no GET /usuarios:', error);
    res.status(500).send('Erro ao buscar usuários: ' + error.message);
  }
});

module.exports = router;