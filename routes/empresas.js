//Imports
import express from 'express';
import pool from '../db.js';
import { popularTabelaEmpresas, criarEmpresasPerfil } from '../app.js'

//Router
const router = express.Router();

//Rota de cadastro de empresa
router.post('/empresas', async (req , res)=>{
    try{
        const { cnpj, nome, telefone, email, senha, razao, cep, complemento, num } = req.body;

        const pesquisaCnpj = await pool.query('SELECT 1 FROM cadastro_empresa WHERE cnpj = $1', [cnpj]);
        const cnpjOk = pesquisaCnpj.rows;
        if (cnpjOk.length > 0) {
            return res.status(400).json({ error: 'CNPJ já cadastrado.' });
        }

        const pesquisaEmail = await pool.query('SELECT 1 FROM cadastro_empresa WHERE emailcadas = $1', [email]);
        const emailOk = pesquisaEmail.rows;
        if (emailOk.length > 0) {
            return res.status(400).json({ error: 'Email já cadastrado.' });
        }

        const pesquisaRazao = await pool.query('SELECT 1 FROM cadastro_empresa WHERE nomejuridico = $1', [razao]);
        const razaoOk  = pesquisaRazao.rows;

        if (razaoOk.length > 0) {
            return res.status(400).json({ error: 'Razão social já cadastrada.'
            });
        }

        await popularTabelaEmpresas(cnpj, nome, telefone, email, senha, razao, cep, complemento, num)

        await criarEmpresasPerfil(cnpj);

        res.status(201).json({ message: 'Empresa cadastrada com sucesso!' });
    }
    catch(error){
        return res.status(500).json({ error: 'Erro ao cadastrar empresa: ' + error.message})
    }
})

export default router;