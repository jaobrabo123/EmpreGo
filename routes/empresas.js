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
        const { rows } = await pool.query('SELECT * FROM cadastro_empresa WHERE cnpj = $1', [cnpj]);

        if (rows.length > 0) {
            return res.status(400).json({ error: 'Empresa já cadastrada.' });
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