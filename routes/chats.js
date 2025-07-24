//Imports
const express = require('express');
const pool = require('../config/db.js');
const { enviarMensagem, criarChat } = require('../services/chatServices.js')
const { authenticateToken } = require('../middlewares/auth.js');
const {ErroDeValidacao} = require('../utils/erroClasses.js')

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

router.get('/chats/info', authenticateToken, async (req, res)=>{
    try{
        const tipo = req.user.tipo
        const id = req.user.id

        if(tipo==='candidato'){
            const chats = await pool.query(`
                select c.id, c.empresa, c.candidato, e.nome_fant, can.nome 
                from chats c join empresas e
                on c.empresa = e.cnpj
                join candidatos can on c.candidato = can.id
                where candidato = $1 order by c.data_criacao desc
            `, [id])
            return res.status(200).json({ chats: chats.rows, tipo: tipo });
        }else
        if(tipo==='empresa'){
            const chats = await pool.query(`
                select c.id, c.empresa, c.candidato, can.nome, e.nome_fant 
                from chats c join candidatos can
                on c.candidato = can.id
                join empresas e on c.empresa = e.cnpj
                where empresa = $1 order by c.data_criacao desc
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
        const { autor, mensagem, chat, de } = req.body;
        const tipo = req.user.tipo
        
        if(de!==tipo){
            return res.status(401).json({ error: 'Tipo enviado e tipo do token não coincidem!' });
        }

        await enviarMensagem(autor, mensagem, de, chat)

        return res.status(201).json({ message: 'Mensagem enviada com sucesso!', tipo: tipo });
    }
    catch(erro){
        if (erro instanceof ErroDeValidacao) {
            return res.status(400).json({ error: erro.message });
        }
        return res.status(500).json({ error: 'Erro ao enviar mensagem: ' + erro.message})
    }
});

/*router.get('/mensagens', async (req, res)=>{
    try{
        const { chat } = req.query
        const mensagens = await pool.query(`select mensagem, de, para from mensagens where chat = $1`,[chat])
        res.status(200).json(mensagens.rows);
    }
    catch(erro){
        return res.status(500).json({ error: 'Erro ao pegar mensagens: ' + erro.message})
    }
});*/

module.exports = router