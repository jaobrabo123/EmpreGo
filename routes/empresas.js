//Imports
const express = require('express');
const pool = require('../db.js');
const { popularTabelaEmpresas } = require('../app.js');

//Router
const router = express.Router();

//Rota de cadastro de empresa
router.post('/empresas', async (req , res)=>{
    try{
        const { cnpj, nome_fant, telefone, email, senha, razao_soci, cep, complemento, numero } = req.body;

        const pesquisaCnpj = await pool.query('SELECT 1 FROM empresas WHERE cnpj = $1', [cnpj]);
        const cnpjOk = pesquisaCnpj.rows;
        if (cnpjOk.length > 0) {
            return res.status(400).json({ error: 'Empresa ja cadastrada.' });
        }

        const pesquisaEmail = await pool.query('SELECT 1 FROM empresas WHERE email = $1', [email]);
        const emailOk = pesquisaEmail.rows;
        if (emailOk.length > 0) {
            return res.status(400).json({ error: 'Empresa ja cadastrada.' });
        }

        const pesquisaRazao = await pool.query('SELECT 1 FROM empresas WHERE razao_soci = $1', [razao_soci]);
        const razaoOk  = pesquisaRazao.rows;

        if (razaoOk.length > 0) {
            return res.status(400).json({ error: 'Empresa ja cadastrada.'});
        }

        await popularTabelaEmpresas(cnpj, nome_fant, telefone, email, senha, razao_soci, cep, complemento, numero);

        res.status(201).json({ message: 'Empresa cadastrada com sucesso!' });
    }
    catch(error){
        return res.status(500).json({ error: 'Erro ao cadastrar empresa: ' + error.message})
    }
})

module.exports = router;