const CandidatoModel = require("../models/candidatoModel");
const EmpresaModel = require("../models/empresaModel");
const CandidatoService = require("../services/candidatoService");
const EmpresaService = require("../services/empresaService");
const { ErroDeValidacao } = require('../utils/erroClasses.js');

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
            console.error(error)
            if (error instanceof ErroDeValidacao) {
                return res.status(400).json({ error: error.message });
            }
            res.status(500).json({ error: 'Erro ao editar perfil: ' + error.message });
        }
    }

    static async buscarEmpresa(req, res){
        try {
            const cnpj = req.user.id;
        
            const empresa = await EmpresaModel.buscarPerfilInfoPorCnpj(cnpj);
        
            if (!empresa) {
              return res.status(404).json({ error: 'Empresa não encontrada' });
            }
        
            res.json(empresa);
        }
        catch (erro) {
            res.status(500).json({ error: 'Erro ao buscar perfil da empresa: ' + erro.message });
        }
    }

    static async editarEmpresa(req, res){
        try {
            const cnpj = req.user.id;
            const dados = { ...req.body };
            if (req.file) {
              dados.foto = req.file.path;
            }
            const atributos = Object.keys(dados);
            const valores = Object.values(dados);
            
            await EmpresaService.editarPerfilEmpresa(atributos, valores, cnpj);
            res.status(201).json({ message: `Perfil atualizado com sucesso! (${atributos.join(', ')})` });
        } 
        catch (error) {
            if (error instanceof ErroDeValidacao) {
                return res.status(400).json({ error: error.message });
            }
            res.status(500).json({ error: 'Erro ao editar perfil da empresa: ' + error.message });
        }
    }

}

module.exports = PerfilController;