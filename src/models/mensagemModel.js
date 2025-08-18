// * Prisma
const prisma = require('../config/prisma.js')

class MensagemModel {

    static async buscarMensagensPorChat(chat){
        const resultado = await prisma.mensagens.findMany({
            select: {
                autor: true,
                mensagem: true,
                chat: true,
                de: true
            },
            where: {
                chat
            },
            orderBy: {
                data_criacao: 'asc'
            }
        });
        const resultadoComAs = resultado.map(msg=>({
            author: msg.autor,
            message: msg.mensagem,
            room: msg.chat,
            type: msg.de
        }));
        return resultadoComAs;
    }

}

module.exports = MensagemModel;