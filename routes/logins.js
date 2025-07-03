//Imports
const express = require('express');
const pool = require('../db.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { limiteLogin } = require('../middlewares/rateLimit.js');
//Router
const router = express.Router();

//Dotenv
const dotenv = require('dotenv');
dotenv.config();

//Secret key para o JWT
const SECRET_KEY = process.env.JWT_SECRET;

//Rota de login
router.post('/login', limiteLogin, async (req, res) => {
  const { email, senha } = req.body;
  try {
    const resultado = await pool.query('SELECT * FROM cadastro_usuarios WHERE email = $1', [email]);
    const usuario = resultado.rows[0];

    if(usuario && await bcrypt.compare(senha, usuario.senha)){
      const token = jwt.sign({ id: usuario.id_usuario, tipo: 'candidato' }, SECRET_KEY, { expiresIn: '1d' });
      res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 86400000
      });
      res.status(200).json({ message: 'Logado com sucesso!' });
    }
    else{
      res.status(401).json({ error: 'Credenciais inválidas.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao fazer login: ' + error.message });
  }
});

router.post('/login-empresa', limiteLogin, async (req, res) =>{
  const { cnpj, senha } = req.body;
  try{
    const resultado = await pool.query('SELECT * FROM cadastro_empresa WHERE cnpj = $1', [cnpj]);
    const empresa = resultado.rows[0];
    if(empresa && await bcrypt.compare(senha, empresa.senhaempre)){
      const token = jwt.sign({ id: empresa.cnpj, tipo: 'empresa' }, SECRET_KEY, { expiresIn: '1d' });
      res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 86400000
      });
      res.status(200).json({ message: 'Logado com sucesso!' });
    }
    else{
      res.status(401).json({ error: 'Credenciais inválidas.' });
    }
  }
  catch(error){
    res.status(500).json({ error: 'Erro ao fazer login: ' + error.message });
  }
})

router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict'
  });
  res.json({ message: 'Logout realizado com sucesso' });
});


module.exports = router;