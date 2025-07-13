//Imports
const express = require('express');
const pool = require('../config/db.js');
const { popularTabelaEmpresas } = require('../services/empresaServices.js');
const ErroDeValidacao = require('../utils/erroValidacao.js');
const { authenticateToken, apenasAdmins } = require('../middlewares/auth.js');

//Router
const router = express.Router();

//Rota de cadastro de empresa
router.post('/empresas', async (req , res)=>{
    try{
        const { cnpj, nome_fant, telefone, email, senha, razao_soci, cep, complemento, numero } = req.body;

        if(!cnpj||!nome_fant||!telefone||!email||!senha||!razao_soci||!cep||!complemento||!numero) return res.status(400).json({ error: 'Informações faltando para o cadastro!' })

        const pesquisaCnpj = await pool.query('SELECT 1 FROM empresas WHERE cnpj = $1', [cnpj]);
        const cnpjOk = pesquisaCnpj.rows;
        if (cnpjOk.length > 0) {
            return res.status(409).json({ error: 'Empresa ja cadastrada.' });
        }

        const pesquisaEmail = await pool.query('SELECT 1 FROM empresas WHERE email = $1', [email]);
        const emailOk = pesquisaEmail.rows;
        if (emailOk.length > 0) {
            return res.status(409).json({ error: 'Empresa ja cadastrada.' });
        }

        const pesquisaRazao = await pool.query('SELECT 1 FROM empresas WHERE razao_soci = $1', [razao_soci]);
        const razaoOk  = pesquisaRazao.rows;

        if (razaoOk.length > 0) {
            return res.status(409).json({ error: 'Empresa ja cadastrada.'});
        }

        await popularTabelaEmpresas(cnpj, nome_fant, telefone, email, senha, razao_soci, cep, complemento, numero);

        res.status(201).json({ message: 'Empresa cadastrada com sucesso!' });
    }
    catch(error){
        if (error instanceof ErroDeValidacao) {
            return res.status(400).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Erro ao cadastrar empresa: ' + error.message})
    }
})

router.get('/empresas', authenticateToken, apenasAdmins, async(req,res)=>{
    try{
        const resultado = await pool.query('SELECT cnpj, nome_fant, telefone, email, razao_soci, cep, complemento, numero FROM empresas');
        res.json(resultado.rows);
    }
    catch(erro){
        res.status(500).json({error: `Erro ao buscar empresas: ${erro?.message||'erro desconhecido'}` })
    }
})

module.exports = router;