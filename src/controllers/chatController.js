const ChatService = require('../services/chatService.js');
const ChatModel = require('../models/chatModel.js');
const Erros = require("../utils/erroClasses.js");

class ChatController {

    static async criar(req, res){
        try{
            const { empresa, candidato } = req.body;
            if(!empresa || !candidato) return res.status(400).json({ error: 'Empresa e candidato precisam ser fornecidos.'})

            await ChatService.criarChat(empresa, candidato)

            res.status(201).json({ message: 'Chat criado com sucesso!' });
        }
        catch(erro){
            return res.status(500).json({ error: 'Erro ao criar chat: ' + erro.message})
        }
    }

    static async listarCand(req, res){
        try{
            const tipo = req.user.tipo;
            const id = req.user.id;
            if(tipo!=='candidato' && tipo!=='empresa') return res.status(401).json({ error: 'Tipo de usuário não reconhecido.'});
            const chats = await ChatModel.buscarChatsInfo(id, tipo);
            return res.status(200).json({ chats: chats, tipo: tipo });
        }
        catch(erro){
            return res.status(500).json({ error: 'Erro ao pegar chats: ' + erro.message})
        }
    }

}

module.exports = ChatController;