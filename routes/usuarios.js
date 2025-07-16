//Imports
const express = require("express");
const pool = require("../config/db.js");
const { popularTabelaCandidatos, removerCandidato } = require("../services/candidatoServices.js");
const { ErroDeValidacao, ErroDeAutorizacao } = require("../utils/erroClasses.js");
const { authenticateToken, apenasAdmins, apenasCandidatos } = require("../middlewares/auth.js");

//router
const router = express.Router();

//Rota de cadastro
router.post('/candidatos', async (req, res) => {
  try {
    const { nome, email, senha, genero, data_nasc } = req.body;

    if (!nome || !email || !senha || !genero || !data_nasc) return res.status(400).json({ error: "Todas as informações devem ser fornecidas para o cadastro!" });

    const { rows } = await pool.query("SELECT 1 FROM candidatos WHERE email = $1", [email]);

    if (rows.length > 0) {
      return res.status(409).json({ error: "Email já cadastrado." });
    }

    await popularTabelaCandidatos(nome, email, senha, genero, data_nasc);

    res.status(201).json({ message: "Usuário cadastrado com sucesso!" });

  } catch (error) {
    if (error instanceof ErroDeValidacao) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Erro ao cadastrar usuário: " + error.message });
  }
});

//Rota para pegar todos os usuários
router.get('/candidatos', authenticateToken, apenasAdmins, async (req, res) => {
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