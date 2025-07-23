//Imports
const express = require("express");
const pool = require("../config/db.js");
const { popularTabelaEmpresas, removerEmpresa } = require("../services/empresaServices.js");
const {ErroDeValidacao} = require("../utils/erroClasses.js");
const { authenticateToken, apenasAdmins, apenasEmpresa } = require("../middlewares/auth.js");

//Router
const router = express.Router();

//Rota de cadastro de empresa
router.post('/empresas', async (req, res) => {
  try {
    const { cnpj, nome_fant, telefone, email, senha, razao_soci, cep, complemento, numero } = req.body;

    if (!cnpj || !nome_fant || !telefone || !email || !senha || !razao_soci || !cep || !numero ) {
      return res.status(400).json({ error: "Informações faltando para o cadastro!" });
    }

    const [pesquisaCnpj, pesquisaEmail, pesquisaRazao] = await Promise.all([
      pool.query('select 1 from empresas where cnpj = $1',[cnpj]),
      pool.query('select 1 from empresas where email = $1', [email]),
      pool.query('select 1 from empresas where razao_soci = $1', [razao_soci])
    ]);

    if(pesquisaCnpj.rowCount > 0 || pesquisaEmail.rowCount > 0 || pesquisaRazao.rowCount > 0){
      return res.status(409).json({ error: "Empresa ja cadastrada." });
    }

    await popularTabelaEmpresas(
      cnpj,
      nome_fant,
      telefone,
      email,
      senha,
      razao_soci,
      cep,
      complemento,
      numero
    );

    res.status(201).json({ message: "Empresa cadastrada com sucesso!" });
  } catch (error) {
    if (error instanceof ErroDeValidacao) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro ao cadastrar empresa: " + error.message });
  }
});

router.get('/empresas/all', authenticateToken, apenasAdmins, async (req, res) => {
  try {
    const resultado = await pool.query(`SELECT 
      cnpj, nome_fant, telefone, email, razao_soci, cep, 
      complemento, numero, descricao, setor, porte, data_fund, 
      contato, site, instagram, github, youtube, twitter,
      data_criacao 
      FROM empresas`);
    res.json(resultado.rows);
  } catch (erro) {
    res.status(500).json({ error: `Erro ao buscar empresas: ${erro?.message || "erro desconhecido"}` });
  }
});

router.delete('/empresas/:em', authenticateToken, apenasEmpresa,async (req, res) => {
  try {
    const { em } = req.params;
    const { id, nivel } = req.user;

    await removerEmpresa(em, id, nivel);

    res.status(200).json({ message: "Empresa removida com sucesso" });
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

module.exports = router;