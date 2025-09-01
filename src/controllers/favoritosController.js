const FavoritosService = require("../services/favoritosService");
const Erros = require("../utils/erroClasses");

class FavoritosController {

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

}

module.exports = FavoritosController;