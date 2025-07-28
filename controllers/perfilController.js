const CandidatoModel = require("../models/candidatoModel");
const CandidatoService = require("../services/candidatoService");

class PerfilController {

    static async buscarCandidato(req, res){
        try {
            const id = req.user.id;

            const perfilCandidato = await CandidatoModel.buscarPerfilInfoPorId(id);

            if (!perfilCandidato) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }

            res.status(200).json(perfilCandidato);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao buscar perfil: ' + error.message });
        }
    }

    static async editarCandidato(req, res){
        try {
            const id = req.user.id;
            const dados = { ...req.body };

            if(!dados) return res.status(400).json({ error: "Os dados a serem editados precisam ser fornecidos." })
            
            if (req.file) {
                dados.foto = req.file.path;
            }

            const atributos = Object.keys(dados);
            const valores = Object.values(dados);

            await CandidatoService.editarPerfil(atributos, valores, id);

            res.status(201).json({ message: `Perfil atualizado com sucesso! (${atributos.join(', ')})` });
        } catch (error) {
            if (error instanceof ErroDeValidacao) {
                return res.status(400).json({ error: error.message });
            }
            res.status(500).json({ error: 'Erro ao editar perfil: ' + error.message });
        }
    }

    static async buscarEmpresa(req, res){
        
    }

}

module.exports = PerfilController;