const { ErroDeValidacao, ErroDeAutorizacao, ErroDeNaoEncontrado } = require('../utils/erroClasses.js');
const TagService = require('../services/tagService.js');
const TagModel = require('../models/tagModel.js')

class TagController {

    static async adicionar(req, res){
        try {
            const { nome } = req.body;
            const id = req.user.id;

            await TagService.popularTabelaTags(nome, id);
            res.status(201).json({ message: 'Tag cadastrada com sucesso!' });
        } catch (error) {
            if (error instanceof ErroDeValidacao) {
                return res.status(400).json({ error: error.message });
            }
            res.status(500).json({ error: 'Erro ao cadastrar tag: ' + error.message });
        }
    }

    static async listar(req, res){
        try {
            const { id } = req.user;
            const tags = await TagModel.buscarTagPorIdCandidato(id);
            res.status(200).json(tags);
        } catch (error) {
            res.status(500).json({error: 'Erro ao buscar tags: ' + error.message});
        }
    }

    static async listarTodas(req, res){
        try{
            const tags = await TagModel.buscarTodasTags();
            res.status(200).json(tags);
        }
        catch(erro){
            res.status(500).json({ error: `Erro ao buscar tags: ${erro?.message||'erro desconhecido'}` });
        }
    }

    static async remover(req, res){
        try{
            const { tg } = req.params;
            const id = req.user.id;
            const nivel = req.user.nivel;

            await TagService.removerTag(tg, id, nivel);

            res.status(200).json({ message: "Tag removida com sucesso." });
        }
        catch(erro){
            console.error(erro)
            if (erro instanceof ErroDeAutorizacao) {
                return res.status(403).json({ error: erro.message });
            }
            if (erro instanceof ErroDeValidacao){
                return res.status(400).json({ error: erro.message });
            }
            if (erro instanceof ErroDeNaoEncontrado){
                return res.status(404).json({ error: erro.message });
            }
            res.status(500).json({ error: "Erro ao remover tag: " + erro.message })
        }
    }

}

module.exports = TagController;