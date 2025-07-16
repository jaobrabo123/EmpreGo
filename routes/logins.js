//Imports
const express = require('express');
const pool = require('../config/db.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { adicionarToken, removerToken } = require('../services/tokenService.js')
const { limparCookieToken } = require('../utils/cookieUtils.js')
//Reativar depois dos testes
//const { limiteLogin } = require('../middlewares/rateLimit.js');

//Router
const router = express.Router();

//Dotenv
const dotenv = require('dotenv');
dotenv.config();

//Secret key para o JWT
const SECRET_KEY = process.env.JWT_SECRET;

//Rota de login
router.post('/login'/*, limiteLogin*/, async (req, res) => {
  try {
    const { email, senha } = req.body; 
    if (!email || !senha) return res.status(400).json({ error: 'Email e senha são obrigatórios' });

    const tkn = req.cookies.token;

    if (tkn) {
      await removerToken(tkn);
    }

    const resultado = await pool.query('SELECT id, senha, nivel FROM candidatos WHERE email = $1', [email]);
    const candidato = resultado.rows[0];

    if(candidato && await bcrypt.compare(senha, candidato.senha)){
      const token = jwt.sign({ id: candidato.id, tipo: 'candidato', nivel: candidato.nivel }, SECRET_KEY, { expiresIn: '1d' });

      res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 7*24*60*60*1000
      });

      const expira_em = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await adicionarToken(candidato.id, 'candidato', token, expira_em)

      res.status(200).json({ message: 'Logado com sucesso!' });
    }
    else{
      res.status(401).json({ error: 'Credenciais inválidas.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao fazer login: ' + error.message });
  }
});

router.post('/login-empresa'/*, limiteLogin*/, async (req, res) =>{
  try{
    const { cnpj, senha } = req.body;
    if (!cnpj || !senha) return res.status(400).json({ error: 'CNPJ e senha são obrigatórios' });

    const resultado = await pool.query('SELECT * FROM empresas WHERE cnpj = $1', [cnpj]);
    const empresa = resultado.rows[0];
    if(empresa && await bcrypt.compare(senha, empresa.senha)){
      const token = jwt.sign({ id: empresa.cnpj, tipo: 'empresa' }, SECRET_KEY, { expiresIn: '1d' });
      
      res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 24*60*60*1000
      });

      const expira_em = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await adicionarToken(empresa.cnpj, 'empresa', token, expira_em);

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

router.post('/logout', async (req, res) => {
  try{
    const token = req.cookies.token;
    if (token) {
      await removerToken(token);
    }
    limparCookieToken(res)
    res.status(200).json({ message: 'Logout realizado com sucesso' });
  }
  catch(erro){
    res.status(500).json({ error: 'Erro ao remover toke: ' + erro.message})
  }
});


module.exports = router;