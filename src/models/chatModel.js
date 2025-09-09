// * Prisma
const prisma = require('../config/db.js');

class ChatModel {

    static async buscarChatsPorCandidato(id){
        const resultado = await prisma.chats.findMany({
            select: {
                id: true
            },
            where: {
                candidato: id
            }
        })
        return resultado;
    }

    static async buscarChatsPorEmpresa(cnpj){
        const resultado = await prisma.chats.findMany({
            select: {
                id: true
            },
            where: {
                empresa: cnpj
            }
        })
        return resultado;
    }

    static async buscarChatsInfo(id, tipo){
        const where = tipo==='candidato' ? { candidato: id } 
            : { empresa: id };
        const resultado = await prisma.chats.findMany({
            select: {
                id: true,
                empresa: true,
                candidato: true,
                empresas: {
                    select: {
                        nome_fant: true,
                        foto: true
                    }
                },
                candidatos: {
                    select: {
                        nome: true,
                        foto: true
                    }
                },
                mensagens: {
                    select: {
                        mensagem: true,
                        de: true,
                        status: true,
                        data_criacao: true
                    },
                    orderBy: {
                        data_criacao: 'asc'
                    }
                }
            },
            where,
            orderBy: {
                data_criacao: 'desc'
            }
        });
        return resultado;
    }

}

module.exports = ChatModel;