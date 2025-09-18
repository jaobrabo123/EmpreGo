const MensagemService = require('../services/mensagemService.js')
const Erros = require("../utils/erroClasses.js");
const axios = require('axios');
const { validarArquivoRawNoCloudinary } = require('../utils/validarCampos.js');

class MensagemController {

    static async criar(req, res){
        try{
            const { autor, mensagem, chat, de } = req.body;

            if(!autor || !mensagem || !chat || !de) return res.status(400).json({ error: 'Informações faltando para enviar mensagem.' })

            const tipo = req.user.tipo
            
            if(de!==tipo){
                return res.status(401).json({ error: 'Tipo enviado e tipo do token não coincidem!' });
            }

            await MensagemService.enviarMensagem(autor, mensagem, de, chat)

            return res.status(201).json({ message: 'Mensagem enviada com sucesso!', tipo: tipo });
        }
        catch(erro){
            if (erro instanceof Erros.ErroDeValidacao) {
                return res.status(400).json({ error: erro.message });
            }
            if (erro instanceof Erros.ErroDeNaoEncontrado) {
                return res.status(404).json({ error: erro.message });
            }
            if (erro instanceof Erros.ErroDeAutorizacao) {
                return res.status(403).json({ error: erro.message });
            }
            return res.status(500).json({ error: 'Erro ao enviar mensagem: ' + erro.message})
        }
    }

    static async vizualizar(req, res){
        try {
            const { chatId } = req.body;
            const { tipo } = req.user;
            await MensagemService.vizualizarMensagens(chatId, tipo);
            res.status(201).json({ message: 'Mensagens vizualizadas com sucesso!' });
        } catch (erro) {
            return res.status(500).json({ error: 'Erro ao enviar mensagem: ' + erro.message})
        }
    }

    static async limparConversa(req, res){
        try {
            const { id, tipo, nivel } = req.user;
            const chatId = Number(req.params.chat);
            await MensagemService.limparChatMensagens(id, tipo, nivel, chatId);
            res.status(200).json({ error: 'Chat limpo com sucesso.'});
        } catch (erro) {
            if(erro.code==='P2025') return res.status(404).json({ error: 'Chat fornecido não exite.' });
            if(erro instanceof Erros.ErroDeAutorizacao) return res.status(403).json({ error: erro.message });
            res.status(500).json({ error: 'Erro ao limpar chat: ' + erro.message });
        }
    }

    static async download(req, res){
        try {
            let { link } = req.query;
            validarArquivoRawNoCloudinary(link);

            const nomeArquivo = link.split('/').pop().split('?')[0];
            const response = await axios.get(link, { responseType: 'stream' });

            res.setHeader('Content-Disposition', `attachment; filename="${nomeArquivo}"`);
            res.setHeader('Content-Type', response.headers['content-type']);

            response.data.pipe(res);
        } catch (erro) {
            console.error(erro);
            if(erro instanceof Erros.ErroDeValidacao) return res.status(400).json({ error: erro.message });
            res.status(500).json({ error: 'Erro ao limpar chat: ' + erro.message });
        }
    }

}

module.exports = MensagemController;