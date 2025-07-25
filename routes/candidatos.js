//Imports
const express = require("express");
const pool = require("../config/db.js");
const jwt = require('jsonwebtoken');
const { popularTabelaCandidatos, removerCandidato, popularTabelaCandidatosPendentes } = require("../services/candidatoServices.js");
const { ErroDeValidacao, ErroDeAutorizacao } = require("../utils/erroClasses.js");
const { adicionarToken, removerToken } = require('../services/tokenService.js');
const { authenticateToken, apenasAdmins, apenasCandidatos } = require("../middlewares/auth.js");
const { limiteNodemailer, limiteValidarCodigo } = require('../middlewares/rateLimit.js')

const transporter = require('../config/nodemailer.js');
const dotenv = require('dotenv');
dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET;
const EMAIL_SERVER = process.env.EMAIL;

//router
const router = express.Router();

//Rota de cadastro
router.post('/candidatos', async (req, res) => {
  try {
    const { nome, email, senha, genero, data_nasc } = req.body;

    if (!nome || !email || !senha || !genero || !data_nasc) return res.status(400).json({ error: "Todas as informações devem ser fornecidas para o cadastro!" });

    const candidatoExistente = await pool.query("SELECT 1 FROM candidatos WHERE email = $1", [email]);
    if (candidatoExistente.rowCount > 0) {
      return res.status(409).json({ error: "Email já cadastrado." });
    }

    const candidatoPreCadastrado = await pool.query("SELECT 1 FROM candidatos_pend WHERE email = $1", [email]);
    if (candidatoPreCadastrado.rowCount > 0) {
      return res.status(409).json({ error: "Email aguardando confirmação." });
    }

    const codigo = Math.floor(Math.random() * 9000) + 1000;
    const expira_em = new Date(Date.now() + 15 * 60 * 1000);

    await popularTabelaCandidatosPendentes(nome, email, senha, genero, data_nasc, codigo, expira_em);

    const emailOptions = {
      from: EMAIL_SERVER,
      to: email,
      subject: 'Código de verificação EmpreGo',
      text: `Seu código de verificação é: ${codigo}`
    }

    transporter.sendMail(emailOptions);

    res.status(201).json({ message: "Pré-cadastro concluído." });

  } catch (error) {
    if (error instanceof ErroDeValidacao) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Erro ao fazer pré-cadastro: " + error.message });
  }
});

router.post('/candidatos/reenviar', limiteNodemailer, async (req, res)=>{
  try{
    const { email } = req.body;
    if(!email) return res.status(400).json({ error: 'Email precisa ser fornecido.' });

    const candidato = await pool.query('select codigo from candidatos_pend where email = $1 and expira_em > now()',
      [email]
    );

    if(!candidato.rows[0]) return res.status(404).json({ error: 'Email fornecido não está aguardando confirmação.'});

    const codigo = candidato.rows[0].codigo;

    const emailOptions = {
      from: EMAIL_SERVER,
      to: email,
      subject: 'Código de verificação EmpreGo (reenvio).',
      text: `Seu código de verificação é: ${codigo}`
    }

    await transporter.sendMail(emailOptions);

    res.status(200).json({ message: 'Reenvio realizado com sucesso.'})
  }
  catch(erro){
    res.status(500).json({ error: `Erro ao reenviar email: ${erro.message}`})
  }
})

router.post('/candidatos/confirmar', limiteValidarCodigo, async (req, res)=>{
  try{
    const { codigo } = req.body;

    if(!codigo) return res.status(400).json({ error: "Codigo de verificação precisa ser fornecido."});

    const response = await pool.query(`select nome, email, senha, genero, data_nasc from candidatos_pend where codigo = $1 and expira_em > now()`, [codigo]);

    if (response.rowCount === 0) {
      return res.status(400).json({ error: "Código inválido ou expirado." });
    }

    const candidato = response.rows[0];

    const novoId = await popularTabelaCandidatos(candidato, codigo);

    const tkn = req.cookies.token;

    if (tkn) {
      await removerToken(tkn);
    }

    const token = jwt.sign({ id: novoId, tipo: 'candidato', nivel: 'comum' }, SECRET_KEY, { expiresIn: '1d' });
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7*24*60*60*1000
    });

    const expira_em = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await adicionarToken(novoId, 'candidato', token, expira_em)

    res.status(201).json({ message: 'Email confirmado com sucesso.'});
  }
  catch(erro){
    console.error("Erro ao confirmar candidato:", erro);
    res.status(500).json({ error: "Código expirado ou email já confirmado." });
  }
})

//Rota para pegar todos os usuários
router.get('/candidatos/all', authenticateToken, apenasAdmins, async (req, res) => {
  try {

    const resultado = await pool.query(`SELECT 
      id, nome, email, genero, data_nasc, 
      descricao, cpf, estado, cidade, instagram,
      github, youtube, twitter, pronomes, nivel,
      data_criacao 
      FROM candidatos`
    );

    res.json(resultado.rows);

  } catch (erro) {
    res.status(500).json({ error: `Erro ao buscar usuários: ${erro?.message || "erro desconhecido"}` });
  }
});

router.delete('/candidatos/:cd', authenticateToken, apenasCandidatos, async (req, res) => {
  try {
    const { cd } = req.params;
    const { id, nivel } = req.user;

    await removerCandidato(cd, id, nivel);

    res.status(200).json({ message: "Candidato removido com sucesso" });
  } catch (erro) {
    if (erro instanceof ErroDeAutorizacao) {
      return res.status(403).json({ error: erro.message });
    }else
    if (erro instanceof ErroDeValidacao){
      return res.status(400).json({ error: erro.message })
    }
    res.status(500).json({ error: erro.message });
  }
});

module.exports = router