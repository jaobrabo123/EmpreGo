// * Imports
const ExperienciaModel = require('../models/experienciaModel.js');
const ExperienciaService = require('../services/experienciaService.js');
const { rollBackDeFoto } = require('../utils/cloudinaryUtils.js');
const Erros = require('../utils/erroClasses.js');

class ExperienciaController {

    static async adicionar(req, res){
        let idImg;
        try {
            const { titulo, descricao } = req.body;
            const id = req.user.id;
            const imagem = req.file?.path || false;
            if(imagem) idImg = req.file.filename;
            await ExperienciaService.popularTabelaExperiencias(titulo, descricao, imagem, id);
            res.status(201).json({ message: "Experiência cadastrada com sucesso!" });
        } catch (error) {
            await rollBackDeFoto(idImg);
            if (error instanceof Erros.ErroDeValidacao) {
                return res.status(400).json({ error: error.message });
            }
            res.status(500).json({ error: "Erro ao cadastrar experiência: " + error.message });
        }
    }

    static async listar(req, res){
        try {
            const id = req.user.id;
            const experiencias = await ExperienciaModel.buscarExperienciasPorCandidatoId(id);
            res.json(experiencias);
        } catch (error) {
            res.status(500).json({ error: "Erro ao buscar experiências: " + error.message });
        }
    }

    static async listarTodos(req, res){
        try {
            const experiencias = await ExperienciaModel.buscarTodasExperiencias();
            res.status(200).json(experiencias);
        } catch (erro) {
            res.status(500).json({ error: `Erro ao buscar todas as experiências: ${ erro?.message || "erro desconhecido" }`});
        }
    }

    static async listarTodosPublic(req, res){
        try {
            const experiencias = await ExperienciaModel.buscarExperienciasPublic();
            res.status(200).json(experiencias);
        } catch (erro) {
            res.status(500).json({ error: `Erro ao buscar experiências: ${erro.message}`});
        }
    }

    static async remover(req, res){
        try {
            const { xp } = req.params;
            const id = req.user.id;
            const nivel = req.user.nivel;

            await ExperienciaService.removerExperiencia(xp, id, nivel);

            res.status(200).json({ message: "Experiência removida com sucesso." });

        } catch (erro) {
            if (erro instanceof Erros.ErroDeAutorizacao) {
                return res.status(403).json({ error: erro.message });
            }else
            if (erro instanceof Erros.ErroDeValidacao){
                return res.status(400).json({ error: erro.message })
            }
            res.status(500).json({ error: "Erro ao remover experiência: " + erro.message })
        }
    }

}

module.exports = ExperienciaController;