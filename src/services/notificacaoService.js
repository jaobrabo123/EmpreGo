// * Prisma
const prisma = require('../config/db.js');
const ValidarCampos = require('../utils/validarCampos.js');
const Erros = require("../utils/erroClasses.js");

class NotificacaoService {

    static async enviarNotificacaoParaEmpresa(tipo = null, titulo, texto, cnpj){
        if(tipo) {
            const tiposPossiveis = ['sistema', 'favoritado'];
            ValidarCampos.validarTamanhoMax(tipo, 20, 'Tipo');
            tipo = tipo.trim();
            if(!tiposPossiveis.includes(tipo)) throw new Erros.ErroDeValidacao("Tipo de notificação inválido.")
        };
        ValidarCampos.validarTamanhoMax(titulo, 60, 'Título');
        ValidarCampos.validarTamanhoMax(texto, 200, 'Texto');
        ValidarCampos.validarCnpj(cnpj);
        titulo = titulo.trim();
        texto = texto.trim();
        cnpj = cnpj.trim();
        const data = { titulo, texto, empresa_cnpj: cnpj };
        if(tipo) data.tipo = tipo;
        const notificacao = await prisma.notificacoes_empresas.create({
            data
        });
        return notificacao;
    }

}

module.exports = NotificacaoService;