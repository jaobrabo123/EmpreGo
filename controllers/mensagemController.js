const MensagemService = require('../services/mensagemService.js')
const Erros = require("../utils/erroClasses.js");

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
            return res.status(500).json({ error: 'Erro ao enviar mensagem: ' + erro.message})
        }
    }

}

module.exports = MensagemController;