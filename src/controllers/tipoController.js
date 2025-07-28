class TipoController {

    static async pegarTipo(req, res){
        res.status(200).json({
            tipo: req.user.tipo,
        });
    }

}

module.exports = TipoController;