const ChatService = require('../services/chatService.js');
const ChatModel = require('../models/chatModel.js');
const Erros = require("../utils/erroClasses.js");

class ChatController {

    static async criar(req, res){
        try{
            const { empresa, candidato } = req.body;
            if(!empresa || !candidato) return res.status(400).json({ error: 'Empresa e candidato precisam ser fornecidos.'})

            const newChat = await ChatService.criarChat(empresa, candidato);

            res.status(201).json(newChat);
        }
        catch(erro){
            return res.status(500).json({ error: 'Erro ao criar chat: ' + erro.message})
        }
    }

    static async listarCand(req, res){
        try{
            const id = req.user.id;
            const chats = await ChatModel.buscarChatsInfoPorCandidatoId(id);
            return res.status(200).json(chats);
        }
        catch(erro){
            return res.status(500).json({ error: 'Erro ao pegar chats: ' + erro.message})
        }
    }

    static async listarEmp(req, res){
        try{
            const cnpj = req.user.id;
            const chats = await ChatModel.buscarChatsInfoPorEmpresaCnpj(cnpj);
            return res.status(200).json(chats);
        }
        catch(erro){
            return res.status(500).json({ error: 'Erro ao pegar chats: ' + erro.message})
        }
    }

    static async deletar(req, res){
        try {
            const { id, tipo, nivel } = req.user;
            const chatId = Number(req.params.id);
            await ChatService.deletarChat(id, tipo, nivel, chatId);
            res.status(200).json({ error: 'Chat removido com sucesso.'});
        } catch (erro) {
            if(erro.code==='P2025') return res.status(404).json({ error: 'Chat fornecido não exite.' });
            if(erro instanceof Erros.ErroDeAutorizacao) return res.status(403).json({ error: erro.message })
            res.status(500).json({ error: 'Erro ao remover chat: ' + erro.message });
        }
    }

    static async bloquear(req, res){
        try {
            const idChat = Number(req.params.id);
            const { bloqueado } = req.body;
            const { id, tipo, nivel } = req.user;
            if(bloqueado==null || !idChat) return res.status(400).json({ error: `Informações faltando para ${bloqueado?'bloquear':'desbloquear'} chat.`});
            await ChatService.bloquearChat(id, tipo, nivel, idChat, bloqueado);
            res.status(200).json({ error: `Chat ${bloqueado?'bloqueado':'desbloqueado'} com sucesso.`});
        } catch (erro) {
            if(erro.code==='P2025') return res.status(404).json({ error: 'Chat fornecido não exite.' });
            if(erro instanceof Erros.ErroDeAutorizacao) return res.status(403).json({ error: erro.message });
            if(erro instanceof Erros.ErroDeValidacao) return res.status(400).json({ error: erro.message });
            res.status(500).json({ error: 'Erro ao atualizar bloqueio do chat: ' + erro.message });
        }
    }

}

module.exports = ChatController;