// * Prisma
const prisma = require('../config/db.js');

class NotificacaoModel {

    static async buscarNotificacoesPorCandidatoId(id){
        const resultado = await prisma.notificacoes_candidatos.findMany({
            where: {
                candidato_id: Number(id)
            }
        })
        return resultado;
    }

    static async buscarNotificacoesPorEmpresaCnpj(cnpj){
        const resultado = await prisma.notificacoes_empresas.findMany({
            where: {
                empresa_cnpj: cnpj
            }
        })
        return resultado;
    }

}

module.exports = NotificacaoModel;