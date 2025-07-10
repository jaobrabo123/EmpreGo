//Imports
const express = require('express');
const pool = require('../config/db.js');
const { enviarMensagem, criarChat } = require('../services/chatServices.js')
const { authenticateToken } = require('../middlewares/auth.js');
const ErroDeValidacao = require('../utils/erroValidacao.js')

//Router
const router = express.Router();

router.post('/chats', authenticateToken, async (req, res)=>{
    try{
        const { empresa, candidato } = req.body;

        await criarChat(empresa, candidato)

        res.status(201).json({ message: 'Chat criado com sucesso!' });
    }
    catch(erro){
        return res.status(500).json({ error: 'Erro ao criar chat: ' + erro.message})
    }
});

router.get('/chats', authenticateToken, async (req, res)=>{
    try{
        const tipo = req.user.tipo
        const id = req.user.id

        if(tipo==='candidato'){
            const chats = await pool.query(`select c.id, c.empresa, c.candidato, e.nome_fant 
                from chats c join empresas e
                on c.empresa = e.cnpj
                where candidato = $1 order by c.criado_em desc
            `, [id])
            return res.status(200).json({ chats: chats.rows, tipo: tipo });
        }else
        if(tipo==='empresa'){
            const chats = await pool.query(`select c.id, c.empresa, c.candidato, e.nome 
                from chats c join candidatos e
                on c.candidato = e.id
                where empresa = $1 order by c.criado_em desc
            `, [id])
            return res.status(200).json({ chats: chats.rows, tipo: tipo });
        }else{
            return res.status(401).json({ error: 'Tipo de usuário não reconhecido.'})
        }

    }
    catch(erro){
        return res.status(500).json({ error: 'Erro ao pegar chats: ' + erro.message})
    }
})

router.post('/mensagens', authenticateToken, async (req, res)=>{
    try{
        const { mensagem, chat } = req.body;
        const tipo = req.user.tipo

        let de = ''
        let para = ''

        if(tipo==='candidato'){
            de = 'candidato'
            para = 'empresa'
        }else if(tipo==='empresa'){
            de = 'empresa'
            para = 'candidato'
        }else{
            return res.status(401).json({ error: 'Tipo de usuário não reconhecido.'})
        }

        await enviarMensagem(mensagem, de, para, chat)

        return res.status(201).json({ message: 'Mensagem enviada com sucesso!', tipo: tipo });
    }
    catch(erro){
        if (erro instanceof ErroDeValidacao) {
            return res.status(400).json({ error: erro.message });
        }
        return res.status(500).json({ error: 'Erro ao enviar mensagem: ' + erro.message})
    }
});

router.get('/mensagens', async (req, res)=>{
    try{
        const { chat } = req.query
        const mensagens = await pool.query(`select mensagem, de, para from mensagens where chat = $1`,[chat])
        res.status(200).json(mensagens.rows);
    }
    catch(erro){
        return res.status(500).json({ error: 'Erro ao pegar mensagens: ' + erro.message})
    }
});

module.exports = router