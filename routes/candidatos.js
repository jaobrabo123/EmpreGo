//Imports
const express = require("express");
const pool = require("../config/db.js");
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const { popularTabelaCandidatos, removerCandidato, popularTabelaCandidatosPendentes } = require("../services/candidatoServices.js");
const { ErroDeValidacao, ErroDeAutorizacao } = require("../utils/erroClasses.js");
const { authenticateToken, apenasAdmins, apenasCandidatos } = require("../middlewares/auth.js");
const { limiteNodemailer } = require('../middlewares/rateLimit.js')

const transporter = require('../config/nodemailer.js');
const dotenv = require('dotenv');
dotenv.config();

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

    const uuid = uuidv4();

    await popularTabelaCandidatosPendentes(nome, email, senha, genero, data_nasc, uuid);

    const emailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Para validar o seu email clique no link abaixo.',
      text: `http://localhost:3001/candidatos/confirmar/${uuid}`
    }

    transporter.sendMail(emailOptions);

    res.status(201).json({ message: "Pré-cadastro concluído.", uuid });

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
    if(!email) res.status(400).json({ error: 'Email precisa ser fornecido.' });

    const candidato = await pool.query('select uuid from candidatos_pend where email = $1',
      [email]
    );

    if(!candidato.rows[0]) return res.status(404).json({ error: 'Email fornecido não está aguardando confirmação.'});

    const uuid = candidato.rows[0].uuid;

    const emailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Para validar o seu email clique no link abaixo (reenvio).',
      text: `http://localhost:3001/candidatos/confirmar/${uuid}`
    }

    await transporter.sendMail(emailOptions);

    res.status(200).json({ message: 'Reenvio realizado com sucesso.'})
  }
  catch(erro){
    res.status(500).json({ error: `Erro ao reenviar email: ${erro.message}`})
  }
})

router.get('/candidatos/confirmar/:uuid', async (req, res)=>{
  try{
    const { uuid } = req.params;

    if(!uuid) return res.status(400).send("Erro ao confirmar email, tente novamente mais tarde.");

    const response = await pool.query(`select nome, email, senha, genero, data_nasc from candidatos_pend where uuid = $1`, [uuid]);

    const candidato = response.rows[0];

    await popularTabelaCandidatos(candidato, uuid);

    res.sendFile(path.join(__dirname, '..', 'public', 'pages', 'confirm.html'));
  }
  catch(erro){
    console.error("Erro ao confirmar candidato:", erro);
    res.status(500).send("Erro ao confirmar email, tente novamente mais tarde.");
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