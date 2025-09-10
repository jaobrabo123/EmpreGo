const FavoritosModels = require("../models/favoritosModel");
const FavoritosService = require("../services/favoritosService");
const Erros = require("../utils/erroClasses");

class FavoritosController {

    static async listarEmpresasFavoritadas(req, res){
        try {
            const { id } = req.user;
            const empresasFav = await FavoritosModels.listarEmpresasFavoritadasPorCandidatoId(id);
            res.status(200).json(empresasFav);
        } catch (erro) {
            res.status(500).json({ error: "Erro ao listar empresas favoritadas: " + erro.message });
        }
    }

    static async favoritarEmpresa(req, res){
        try {
            const { cnpj } = req.body;
            const { id } = req.user;
            if(!cnpj) return res.status(400).json({ error: "O CNPJ da empresa deve ser fornecido." });
            await FavoritosService.candidatoFavoritarEmpresa(cnpj, id);
            res.status(201).json({ message: "Empresa favoritada com sucesso." });
        } catch (erro) {
            if(erro instanceof Erros.ErroDeValidacao) {
                return res.status(400).json({ error: erro.message });
            };
            res.status(500).json({ error: "Erro ao favoritar empresa: " + erro.message });
        }
    }

    static async desfavoritarEmpresa(req, res){
        try {
            const { cnpj } = req.params;
            const { id } = req.user;
            if(!cnpj) return res.status(400).json({ error: "O CNPJ da empresa deve ser fornecido." });
            await FavoritosService.candidatoDesfavoritarEmpresa(cnpj, id);
            res.status(200).json({ message: "Empresa desfavoritada com sucesso." });
        } catch (erro) {
            res.status(500).json({ error: "Erro ao desfavoritar empresa: " + erro.message });
        }
    }

    static async listarCandidatosFavoritados(req, res){
        try {
            const cnpj = req.user.id;
            const candidatosFav = await FavoritosModels.listarCandidatosFavoritadosPorEmpresaCnpj(cnpj);
            res.status(200).json(candidatosFav);
        } catch (erro) {
            res.status(500).json({ error: "Erro ao listar candidatos favoritados: " + erro.message });
        }
    }

    static async favoritarCandidato(req, res){
        try {
            const { cd } = req.body;
            const cnpj = req.user.id;
            if(!cd) return res.status(400).json({ error: "O ID do candidato deve ser fornecido." });
            await FavoritosService.empresaFavoritarCandidato(cnpj, cd);
            res.status(201).json({ message: "Candidato favoritado com sucesso." });
        } catch (erro) {
            if(erro instanceof Erros.ErroDeValidacao) {
                return res.status(400).json({ error: erro.message });
            };
            res.status(500).json({ error: "Erro ao favoritar candidato: " + erro.message });
        }
    }

    static async desfavoritarCandidato(req, res){
        try {
            const { cd } = req.params;
            const cnpj = req.user.id;
            if(!cd) return res.status(400).json({ error: "O ID do candidato deve ser fornecido." });
            await FavoritosService.empresaDesfavoritarCandidato(cnpj, cd);
            res.status(200).json({ message: "Candidato desfavoritado com sucesso." });
        } catch (erro) {
            res.status(500).json({ error: "Erro ao desfavoritar candidato: " + erro.message });
        }
    }

    static async favoritarChat(req, res){
        try {
            const {id, tipo} = req.user;
            const {chatId} = req.body;
            if(tipo==='candidato'){
                await FavoritosService.candidatoFavoritarChat(chatId, id);
            } else{
                await FavoritosService.empresaFavoritarChat(chatId, id)
            }
            res.status(201).json({ message: "Chat favoritado com sucesso." });
        } catch (erro) {
            if(erro instanceof Erros.ErroDeValidacao){
                return res.status(400).json({error: erro.message})
            }
            res.status(500).json({ error: "Erro ao favoritar chat: " + erro.message });
        }
    }

    static async desfavoritarChat(req, res){
        try {
            const { id, tipo } = req.user;
            const { ct } = req.params;
            if(tipo==='candidato'){
                await FavoritosService.candidatoDesfavoritarChat(Number(ct), id);
            } else{
                await FavoritosService.empresaDesfavoritarChat(Number(ct), id)
            }
            res.status(201).json({ message: "Chat desfavoritado com sucesso." });
        } catch (erro) {
            res.status(500).json({ error: "Erro ao desfavoritar chat: " + erro.message });
        }
    }

}

module.exports = FavoritosController;