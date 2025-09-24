const MensagemService = require('../services/mensagemService.js')
const Erros = require("../utils/erroClasses.js");
const axios = require('axios');
const { validarArquivoRawNoCloudinary } = require('../utils/validarCampos.js');
const { rollBackDeArquivoRaw, rawUploader, rollBackDeFoto, chatImageUploader } = require('../utils/cloudinaryUtils.js');

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
            res.status(201).json({ message: 'Mensagens vizualizadas com sucesso.' });
        } catch (erro) {
            return res.status(500).json({ error: 'Erro ao enviar mensagem: ' + erro.message})
        }
    }

    static async deletar(req, res){
        try {
            const { id, tipo, nivel } = req.user;
            const msgId = Number(req.params.id);
            //await MensagemService.ocultarMensagem(id, tipo, nivel, msgId);
            
            await MensagemService.deletarMensagem(id, tipo, nivel, msgId);
            
            res.status(200).json({ message: 'Mensagem apagada com sucesso.'});
        } catch (erro) {
            if (erro instanceof Erros.ErroDeValidacao) {
                return res.status(400).json({ error: erro.message });
            }
            res.status(500).json({ error: 'Erro ao apagar mensagem: ' + erro.message})
        }
    }

    static async ocultar(req, res){
        try {
            const { id, tipo } = req.user;
            const msgId = req.body.id;
            if(!msgId) return res.status(400).json({ error: "O ID da mensagem precisa ser fornecido." })

            await MensagemService.ocultarMensagem(id, tipo, msgId);

            res.status(201).json({ message: 'Mensagem oculta com sucesso.'});
        } catch (erro) {
            res.status(500).json({ error: 'Erro ao ocultar mensagem: ' + erro.message})
        }
    }

    static async limparConversa(req, res){
        try {
            const { id, tipo, nivel } = req.user;
            const chatId = Number(req.params.chat);
            await MensagemService.limparChatMensagens(id, tipo, nivel, chatId);
            res.status(200).json({ message: 'Chat limpo com sucesso.'});
        } catch (erro) {
            if(erro.code==='P2025') return res.status(404).json({ error: 'Chat fornecido não exite.' });
            if(erro instanceof Erros.ErroDeAutorizacao) return res.status(403).json({ error: erro.message });
            res.status(500).json({ error: 'Erro ao limpar chat: ' + erro.message });
        }
    }

    static async download(req, res){
        try {
            const { link } = req.query;
            validarArquivoRawNoCloudinary(link);

            const nomeArquivo = link.split('/').pop().split('?')[0].slice(14);
            const response = await axios.get(link, { responseType: 'stream' });
            let nomeArquivoFixed = decodeURIComponent(nomeArquivo);
            nomeArquivoFixed = Buffer.from(nomeArquivoFixed, 'latin1').toString('utf8');

            res.setHeader('Content-Disposition', `attachment; filename="${nomeArquivoFixed}"`);
            res.setHeader('Content-Type', response.headers['content-type']);
            response.data.pipe(res);
        } catch (erro) {
            if(erro instanceof Erros.ErroDeValidacao) return res.status(400).json({ error: erro.message });
            res.status(500).json({ error: 'Erro ao limpar chat: ' + erro.message });
        }
    }

    static async upload(req, res){
        let idFile;
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
            }
            const { autor, chat, de } = req.body;
            const file = req.file;
            const nomeFile = file.originalname;
            
            idFile = `${Date.now()}-${nomeFile}`;

            const result = await rawUploader(file, idFile);

            const sizeFile = (file.size / 1024).toFixed(2) + 'KB';

            const newFile = await MensagemService.enviarArquivo(autor, Number(chat), de, result.secure_url, sizeFile, nomeFile);

            res.status(201).json({ newFile });
        } catch (erro) {
            await rollBackDeArquivoRaw(idFile);
            if (erro instanceof Erros.ErroDeValidacao) {
                return res.status(400).json({ error: erro.message });
            }
            if (erro instanceof Erros.ErroDeNaoEncontrado) {
                return res.status(404).json({ error: erro.message });
            }
            if (erro instanceof Erros.ErroDeAutorizacao) {
                return res.status(403).json({ error: erro.message });
            }
            res.status(500).json({ error: 'Erro ao salvar arquivo: ' + erro.message})
        }
    }

    static async uploadFoto(req, res){
        let idFoto;
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'Nenhuma imagem enviada.' });
            }
            const { autor, chat, de } = req.body;
            const foto = req.file;
            const nomeFoto = foto.originalname;
            
            idFoto = `${Date.now()}-${nomeFoto}`;

            const result = await chatImageUploader(foto, idFoto);

            const sizeFile = (foto.size / 1024).toFixed(2) + 'KB';

            const newImage = await MensagemService.enviarFoto(autor, Number(chat), de, result.secure_url, sizeFile, nomeFoto);

            res.status(201).json({ newImage });
        } catch (erro) {
            await rollBackDeFoto(idFoto);
            if (erro instanceof Erros.ErroDeValidacao) {
                return res.status(400).json({ error: erro.message });
            }
            if (erro instanceof Erros.ErroDeNaoEncontrado) {
                return res.status(404).json({ error: erro.message });
            }
            if (erro instanceof Erros.ErroDeAutorizacao) {
                return res.status(403).json({ error: erro.message });
            }
            res.status(500).json({ error: 'Erro ao salvar foto: ' + erro.message})
        }
    }

}

module.exports = MensagemController;